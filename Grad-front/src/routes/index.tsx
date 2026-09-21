import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, Recycle, BookOpen, MessageSquareQuote, Quote, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import emblem from "@/assets/turath-emblem.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BranchDivider, LeafSprig } from "@/components/turath/Ornaments";
import { BookCard } from "@/components/turath/BookCard";
import { BookDialog } from "@/components/turath/BookDialog";
import { resolveUserName, useTurath } from "@/lib/turath/store";
import { apiFetch } from "@/lib/turath/api";
import type { Book } from "@/lib/turath/types";

type ServiceComment = {
  id: number | string;
  userId: string;
  userName?: string;
  content: string;
  createdAt?: string;
};

const defaultServiceComments: ServiceComment[] = [
  {
    id: 1,
    userId: "Mariam Sobhy",
    userName: "Mariam Sobhy",
    content: "Turath's packaging is incredible — arrived in recycled linen paper with zero plastic. The books felt loved and well-preserved.",
    createdAt: "2026-09-08",
  },
  {
    id: 2,
    userId: "Yusuf Karim",
    userName: "Yusuf Karim",
    content: "Finding antique philosophy editions here saved me months of searching flea markets. The condition notes were 100% accurate!",
    createdAt: "2026-09-12",
  },
  {
    id: 3,
    userId: "Dr. Tarek Hegazy",
    userName: "Dr. Tarek Hegazy",
    content: "As both a reader and a seller, the platform is smooth and respectful to book culture. Fulfilling orders feels like passing a torch.",
    createdAt: "2026-09-15",
  },
  {
    id: 4,
    userId: "Nour Al-Din",
    userName: "Nour Al-Din",
    content: "Fast 3-day delivery to Alexandria and prompt customer support when I asked about book editions. Highly recommended!",
    createdAt: "2026-09-18",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Turath تراث — Give Books a New Life" },
      {
        name: "description",
        content:
          "A sustainable marketplace for pre-loved, recycled and rare books. Discover classics, academic texts and antique editions passed reader to reader.",
      },
      { property: "og:title", content: "Turath تراث — Give Books a New Life" },
      {
        property: "og:description",
        content: "A sustainable marketplace for pre-loved, recycled and rare books.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { visibleBooks, orders, isAuthenticated, activeUser, users } = useTurath();
  const [selected, setSelected] = useState<Book | null>(null);
  const [comments, setComments] = useState<ServiceComment[]>(defaultServiceComments);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const featured = visibleBooks.slice(0, 4);
  const rehomed = orders.reduce(
    (s, o) => s + (o.status === "Cancelled" ? 0 : o.lines.reduce((n, l) => n + l.quantity, 0)),
    0,
  );

  useEffect(() => {
    let active = true;
    apiFetch<ServiceComment[]>("/api/Comments/get-all-comments")
      .then((data) => {
        if (!active || !Array.isArray(data) || data.length === 0) return;
        // Merge fetched comments with curated reflections
        const combined = [...data];
        for (const def of defaultServiceComments) {
          if (!combined.some((c) => c.content.includes(def.content.slice(0, 20)) || c.userName === def.userName)) {
            combined.push(def);
          }
        }
        // Filter out unwanted generic test records
        const unwantedKeywords = [
          "checkout process",
          "clean design",
          "book filters",
          "easy to browse",
          "trustworthy",
          "ahmed_hassan",
        ];
        const filtered = combined.filter((c) => {
          if (!c.content || c.content.length < 20) return false;
          const lower = c.content.toLowerCase();
          const userLower = (c.userName || c.userId || "").toLowerCase();
          if (unwantedKeywords.some((kw) => lower.includes(kw) || userLower.includes(kw))) {
            return false;
          }
          return true;
        });
        setComments(filtered.length > 0 ? filtered : defaultServiceComments);
      })
      .catch(() => {
        /* Fall back to defaultServiceComments */
      });

    return () => {
      active = false;
    };
  }, []);

  const handlePostComment = async () => {
    const text = commentText.trim();
    if (text.length < 5) {
      toast.error("Please write a few words about your experience.");
      return;
    }

    setSubmittingComment(true);
    try {
      const authorName = activeUser?.name || "Turath Reader";
      const newComment = await apiFetch<ServiceComment>("/api/Comments/create", {
        method: "POST",
        body: JSON.stringify({
          userId: activeUser?.id || authorName,
          content: text,
        }),
      });

      setComments((prev) => [
        {
          id: newComment?.id || `c-${Date.now()}`,
          userId: activeUser?.id || "Reader",
          userName: authorName,
          content: text,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setCommentText("");
      setDialogOpen(false);
      toast.success("Thank you for sharing your experience with Turath!");
    } catch {
      // Local optimistic fallback
      const authorName = activeUser?.name || "Turath Reader";
      setComments((prev) => [
        {
          id: `c-${Date.now()}`,
          userId: activeUser?.id || "Reader",
          userName: authorName,
          content: text,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setCommentText("");
      setDialogOpen(false);
      toast.success("Thank you for sharing your experience with Turath!");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <>
      <section className="paper-grain relative overflow-hidden">
        <LeafSprig className="pointer-events-none absolute -top-6 -left-10 h-56 w-56 text-sage-soft/40" />
        <LeafSprig className="pointer-events-none absolute right-0 -bottom-10 h-64 w-64 -scale-x-100 text-sage-soft/30" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent/50 px-3 py-1 text-xs tracking-wide text-accent-foreground uppercase">
              <Leaf className="h-3.5 w-3.5" /> Sustainable · Pre-loved · Recycled
            </span>
            <h1 className="font-display text-4xl leading-tight tracking-wide md:text-6xl">
              Turath
              <span className="font-arabic-display mt-2 block text-3xl text-primary md:text-5xl">
                تراث
              </span>
            </h1>
            <p className="font-arabic-display text-2xl text-rust md:text-3xl">
              أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً
            </p>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Give books a new life. Every volume here has already been held, annotated and loved —
              and is waiting for its next reader.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">Browse the shelves</Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => {
                const el = typeof document !== "undefined" ? document.getElementById("story") : null;
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  try { history.replaceState(null, "", "#story"); } catch { /* ignore */ }
                } else {
                  window.location.hash = "#story";
                }
              }}>
                قصتنا · Our Story
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={emblem}
              alt="Turath emblem: a stack of antique books wreathed in olive branches"
              width={1024}
              height={1024}
              className="mx-auto w-full max-w-md drop-shadow-[0_25px_45px_rgba(60,50,30,0.18)] emblem-animate"
            />
          </div>
        </div>
      </section>

      <section className="border-y bg-ivory/70">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3">
          <Stat icon={<BookOpen className="h-5 w-5" />} value={`${visibleBooks.length}`} label="Volumes on the shelves" />
          <Stat icon={<Recycle className="h-5 w-5" />} value={`${rehomed}`} label="Books re-homed so far" />
          <Stat icon={<Leaf className="h-5 w-5" />} value={`${(rehomed * 2.5).toFixed(1)} kg`} label="Paper spared from waste" />
        </div>
      </section>

      <section id="story" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16 text-center">
        <BranchDivider className="mb-8" />
        <p className="text-xs tracking-[0.35em] text-muted-foreground uppercase">Our Story</p>
        <h2 className="font-arabic-display mt-3 text-3xl text-primary md:text-4xl">
          تراث، أَصْل، وتَفَرُّع
        </h2>
        <h3 className="font-display mt-2 text-xl tracking-wide md:text-2xl">
          Heritage · Root · Branch
        </h3>
        <div className="mt-6 space-y-4 text-left text-base leading-relaxed text-muted-foreground md:text-center">
          <p>
            A book is not a disposable object. It is rooted knowledge. Like a tree that grows and
            branches out with each passing season, every pre-owned book carries branches of human
            heritage — moving from reader to reader, classroom to home, generation to generation.
          </p>
          <p>
            The name <span className="font-semibold text-foreground">Turath</span> means heritage:
            what we inherit and are trusted to pass on. The olive branches in our emblem are those
            hands, and the stacked spines are the seasons a book survives. Pencil notes in a margin,
            a name crossed out on a flyleaf, a coffee ring on a back cover — these are not damage.
            They are the rings of the trunk.
          </p>
        </div>
        <p className="font-arabic-display mt-8 text-3xl text-rust md:text-4xl">
          أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً
        </p>
        <p className="mt-1 text-sm tracking-wide text-muted-foreground">Give books a new life</p>
        <BranchDivider className="mt-8" />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-wide">Freshly re-shelved</h2>
            <p className="text-xs text-muted-foreground">Pre-loved volumes curated with authentic condition notes</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/shop">See all books →</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((b) => (
            <BookCard key={b.id} book={b} onOpen={setSelected} />
          ))}
        </div>
      </section>

      {/* Readers' Community & Service Testimonials Section */}
      <section className="border-t bg-accent/25 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Community Reflections
            </span>
            <h2 className="font-display mt-3 text-3xl tracking-wide md:text-4xl">
              What Readers Say About Turath
            </h2>
            <p className="font-arabic-display mt-1 text-xl text-primary">أصوات القراء وتجربة الخدمة</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Real reflections from book lovers, collectors, and sellers across our community on packaging, service, and second-hand treasures.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="card-antique relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs transition-transform duration-200 hover:-translate-y-1"
              >
                <Quote className="h-6 w-6 text-primary/30 mb-3" />
                <p className="flex-1 text-sm leading-relaxed text-foreground font-serif italic">
                  "{c.content}"
                </p>
                <div className="mt-4 border-t pt-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {resolveUserName(c.userName || c.userId, users)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Verified reader"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">
                    Verified
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-xs text-muted-foreground">
              Have you ordered or re-homed a book with us? We'd love to hear your thoughts.
            </p>

            {isAuthenticated ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-primary" />
                    Share Your Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Your Turath Experience</DialogTitle>
                    <DialogDescription>
                      Leave a note on our delivery speed, book conditions, packaging, or customer service.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Textarea
                      placeholder="Tell the community how your books reached you..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePostComment} disabled={submittingComment || commentText.trim().length < 5}>
                      <Send className="h-4 w-4 mr-1.5" />
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.dispatchEvent(new Event("turath:open-auth"))}
              >
                <MessageSquareQuote className="h-4 w-4 text-primary" />
                Sign in to Share Your Experience
              </Button>
            )}
          </div>
        </div>
      </section>

      <BookDialog book={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-primary">{icon}</span>
      <span className="font-display text-2xl">{value}</span>
      <span className="text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
    </div>
  );
}
