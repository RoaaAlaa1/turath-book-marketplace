#!/usr/bin/env python3
"""
Resolve every book in turath-seed-data-round2-strict-template.sql to a REAL
cataloged cover image URL, then write a final executable SQL file.

Sources:
  1) Google Books Volumes API (preferred)
  2) Open Library Search/Covers API (fallback)

The script deliberately fails instead of inventing/guessing a cover URL.
Run:
    python resolve_real_book_covers.py

Optional:
    python resolve_real_book_covers.py input.sql output.sql
"""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote_plus

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DEFAULT_INPUT = "turath-seed-data-round2-strict-template.sql"
DEFAULT_OUTPUT = "turath-seed-data-round2-strict.sql"

SELLER_IDS = {
    "e89be4a0-a929-48f1-aab9-a611b58f6be1",
    "e89be4a0-a929-48f1-aab9-a611b58f6be2",
    "e89be4a0-a929-48f1-aab9-a611b58f6be3",
    "e89be4a0-a929-48f1-aab9-a611b58f6be4",
    "e89be4a0-a929-48f1-aab9-a611b58f6be5",
    "e89be4a0-a929-48f1-aab9-a611b58f6be6",
}

TUPLE_RE = re.compile(
    r"\(N'((?:''|[^'])*)', N'((?:''|[^'])*)', N'((?:''|[^'])*)', "
    r"(\d+), (\d+), N'((?:''|[^'])*)', "
    r"N'__REAL_COVER_URL_REQUIRED__', N'([^']+)'\)"
)

def unsql(s: str) -> str:
    return s.replace("''", "'")

def sqlstr(s: str) -> str:
    return "N'" + s.replace("'", "''") + "'"

def norm(s: str) -> str:
    s = s.lower().replace("&", "and")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def author_match(wanted: str, authors: list[str]) -> bool:
    w = norm(wanted)
    if not w:
        return False
    for a in authors:
        na = norm(a)
        if na == w or w in na or na in w:
            return True
        # Last-name fallback for transliteration/name-order differences.
        wl = w.split()[-1]
        if wl and wl in na:
            return True
    return False

def title_score(wanted: str, candidate: str) -> int:
    a, b = norm(wanted), norm(candidate)
    if a == b:
        return 100
    if a in b or b in a:
        return 80
    aw, bw = set(a.split()), set(b.split())
    if not aw:
        return 0
    return int(60 * len(aw & bw) / len(aw))

def get_google_cover(session: requests.Session, title: str, author: str) -> str | None:
    q = f'intitle:"{title}" inauthor:"{author}"'
    url = "https://www.googleapis.com/books/v1/volumes?q=" + quote_plus(q) + "&maxResults=10"
    r = session.get(url, timeout=30)
    r.raise_for_status()
    data = r.json()

    candidates = []
    for item in data.get("items", []):
        vi = item.get("volumeInfo", {})
        candidate_title = vi.get("title", "")
        authors = vi.get("authors", [])
        links = vi.get("imageLinks", {})
        image = (
            links.get("extraLarge")
            or links.get("large")
            or links.get("medium")
            or links.get("small")
            or links.get("thumbnail")
        )
        if not image or not candidate_title or not author_match(author, authors):
            continue
        score = title_score(title, candidate_title)
        if score >= 80:
            candidates.append((score, image, candidate_title, authors, item.get("id")))
    if not candidates:
        return None
    candidates.sort(reverse=True, key=lambda x: x[0])
    image = candidates[0][1]
    return image.replace("http://", "https://")

def get_openlibrary_cover(session: requests.Session, title: str, author: str) -> str | None:
    params = {
        "title": title,
        "author": author,
        "limit": 20,
        "fields": "title,author_name,cover_i,isbn,key",
    }
    r = session.get("https://openlibrary.org/search.json", params=params, timeout=30)
    r.raise_for_status()
    data = r.json()

    candidates = []
    for doc in data.get("docs", []):
        candidate_title = doc.get("title", "")
        authors = doc.get("author_name", [])
        cover_id = doc.get("cover_i")
        if not cover_id or not candidate_title or not author_match(author, authors):
            continue
        score = title_score(title, candidate_title)
        if score >= 80:
            candidates.append((score, int(cover_id)))
    if not candidates:
        return None
    candidates.sort(reverse=True, key=lambda x: x[0])
    cover_id = candidates[0][1]
    return f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg?default=false"

def verify_image(session: requests.Session, url: str) -> bool:
    # Google/Open Library may not expose a useful HEAD response, so use GET
    # with a small streamed response and require an image content type.
    r = session.get(url, stream=True, timeout=30, allow_redirects=True)
    try:
        if r.status_code != 200:
            return False
        ctype = (r.headers.get("content-type") or "").lower()
        return ctype.startswith("image/")
    finally:
        r.close()

def build_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=5,
        connect=5,
        read=5,
        status=5,
        backoff_factor=1.5,
        allowed_methods=None,
        status_forcelist=(429, 500, 502, 503, 504),
        respect_retry_after_header=True,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "User-Agent": "TurathSeedCoverResolver/1.0 (book catalog seed)"
    })
    return session


def main() -> int:
    input_name = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
    output_name = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT

    in_path = Path(input_name)
    out_path = Path(output_name)
    text = in_path.read_text(encoding="utf-8")

    books = []
    for m in TUPLE_RE.finditer(text):
        books.append({
            "title": unsql(m.group(1)),
            "author": unsql(m.group(2)),
            "age": m.group(7),
        })

    if len(books) != 240:
        raise SystemExit(f"ERROR: expected 240 books, found {len(books)}")

    session = build_session()

    cache_path = Path("turath-cover-cache.json")
    cache = {}
    if cache_path.exists():
        cache = json.loads(cache_path.read_text(encoding="utf-8"))

    resolved = {}
    failures = []

    for i, book in enumerate(books, 1):
        key = f"{book['title']}|||{book['author']}"
        if key in cache:
            url = cache[key]
        else:
            url = None
            try:
                url = get_google_cover(session, book["title"], book["author"])
            except Exception as exc:
                print(f"[Google Books warning] {book['title']}: {exc}", file=sys.stderr)

            if not url:
                try:
                    url = get_openlibrary_cover(session, book["title"], book["author"])
                except Exception as exc:
                    print(f"[Open Library warning] {book['title']}: {exc}", file=sys.stderr)

            if url:
                try:
                    if not verify_image(session, url):
                        print(f"[verification failed] {book['title']}", file=sys.stderr)
                        url = None
                except Exception as exc:
                    print(f"[image verification warning] {book['title']}: {exc}", file=sys.stderr)
                    url = None

            cache[key] = url
            cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
            time.sleep(0.6)

        if not url:
            failures.append(f"{book['title']} — {book['author']}")
        else:
            resolved[key] = url

        print(f"[{i:03d}/240] {'OK' if url else 'FAIL'} {book['title']}")

    if failures:
        print("\nERROR: strict mode refuses to create a partial SQL file.")
        print("Books without a verified real cover:")
        for item in failures:
            print("  -", item)
        return 2

    def replace_tuple(m: re.Match) -> str:
        title = unsql(m.group(1))
        author = unsql(m.group(2))
        key = f"{title}|||{author}"
        return (
            f"(N'{m.group(1)}', N'{m.group(2)}', N'{m.group(3)}', {m.group(4)}, "
            f"{m.group(5)}, N'{m.group(6)}', {sqlstr(resolved[key])}, N'{m.group(7)}')"
        )

    final_text = TUPLE_RE.sub(replace_tuple, text)

    if "__REAL_COVER_URL_REQUIRED__" in final_text:
        raise SystemExit("ERROR: unresolved image placeholder remains")

    out_path.write_text(final_text, encoding="utf-8")
    print(f"\nCreated: {out_path.resolve()}")
    print("All 240 books have verified image URLs.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
