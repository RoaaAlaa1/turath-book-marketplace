import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Recycle, BookOpen } from "lucide-react";
import emblem from "@/assets/turath-emblem.png";
import { Button } from "@/components/ui/button";
import { BranchDivider, LeafSprig } from "@/components/turath/Ornaments";
import { BookCard } from "@/components/turath/BookCard";
import { BookDialog } from "@/components/turath/BookDialog";
import { useTurath } from "@/lib/turath/store";
import type { Book } from "@/lib/turath/types";

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
  const { visibleBooks, orders } = useTurath();
  const [selected, setSelected] = useState<Book | null>(null);
  const featured = visibleBooks.slice(0, 4);
  const rehomed = orders.reduce(
    (s, o) => s + (o.status === "Cancelled" ? 0 : o.lines.reduce((n, l) => n + l.quantity, 0)),
    0,
  );

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

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-wide">Freshly re-shelved</h2>
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
