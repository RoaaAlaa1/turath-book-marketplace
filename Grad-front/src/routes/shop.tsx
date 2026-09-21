import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookCard } from "@/components/turath/BookCard";
import { BookDialog } from "@/components/turath/BookDialog";
import { BranchDivider } from "@/components/turath/Ornaments";
import { avgRating, useTurath } from "@/lib/turath/store";
import type { Book, Condition } from "@/lib/turath/types";

const conditions: Condition[] = ["Acceptable", "Good", "Like New", "Vintage Collector"];

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Pre-loved Books — Turath" },
      {
        name: "description",
        content:
          "Search and filter classic literature, academic texts, rare antiques, fiction, philosophy and children's books, all pre-loved.",
      },
      { property: "og:title", content: "Shop Pre-loved Books — Turath" },
      {
        property: "og:description",
        content: "Search, filter and sort second-hand and rare books on Turath.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { visibleBooks, categories } = useTurath();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [cond, setCond] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [selected, setSelected] = useState<Book | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = visibleBooks.filter((b) => {
      const matches =
        !term ||
        [b.title, b.titleAr ?? "", b.author, b.description, b.category].some((f) =>
          f.toLowerCase().includes(term),
        );
      return matches && (cat === "all" || b.category === cat) && (cond === "all" || b.condition === cond);
    });
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => avgRating(b) - avgRating(a));
    return list;
  }, [visibleBooks, q, cat, cond, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-3xl tracking-wide">The Shelves</h1>
        <p className="font-arabic-display mt-1 text-xl text-primary">رفوف الكتب</p>
        <BranchDivider className="mt-4" />
      </header>

      <div className="mt-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="shop-search" className="text-xs">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="shop-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Title, author or keyword"
              className="pl-9"
            />
          </div>
        </div>
        <Field label="Category" value={cat} onChange={setCat} options={["all", ...categories]} />
        <Field label="Condition" value={cond} onChange={setCond} options={["all", ...conditions]} />
        <Field
          label="Sort by"
          value={sort}
          onChange={setSort}
          options={["relevance", "price-asc", "price-desc", "rating"]}
          labels={{
            relevance: "Relevance",
            "price-asc": "Price: low to high",
            "price-desc": "Price: high to low",
            rating: "Highest rated",
          }}
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "volume" : "volumes"} found
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((b) => (
          <BookCard key={b.id} book={b} onOpen={setSelected} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-arabic-display text-2xl text-primary">لا توجد نتائج</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No books match this search. Try loosening a filter.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQ("");
              setCat("all");
              setCond("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <BookDialog book={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  const id = `field-${label.replace(/\s/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full md:w-[190px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {labels?.[o] ?? (o === "all" ? `All ${label.toLowerCase()}` : o)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
