import { useState } from "react";
import { Heart, Star, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { BookCover } from "./BookCover";
import { Stars } from "./Stars";
import { avgRating, egp, useTurath } from "@/lib/turath/store";
import type { Book } from "@/lib/turath/types";

export function BookDialog({
  book,
  onOpenChange,
}: {
  book: Book | null;
  onOpenChange: (o: boolean) => void;
}) {
  const { addToCart, toggleWishlist, wishlist, sellerName, addReview, activeUser, orders, role } =
    useTurath();
  const [angle, setAngle] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!book) return null;
  const wished = wishlist.includes(book.id);
  const purchased = orders.some(
    (o) => o.customerId === activeUser.id && o.lines.some((l) => l.bookId === book.id),
  );
  const canReview = role === "customer" && purchased;

  const submitReview = () => {
    if (comment.trim().length < 4) return;
    addReview(book.id, { author: activeUser.name, rating, comment: comment.trim(), verified: true });
    setComment("");
    toast.success("Review published");
  };

  return (
    <Dialog open={!!book} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">{book.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="space-y-3">
            <BookCover
              book={book}
              angle={book.images[angle] ?? "front"}
              className="aspect-[3/4] w-full"
            />
            <div className="flex gap-2">
              {book.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setAngle(i)}
                  aria-label={`View ${img}`}
                  aria-pressed={angle === i}
                  className={`overflow-hidden rounded-sm border-2 transition ${
                    angle === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <BookCover book={book} angle={img} className="h-16 w-12" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {book.titleAr && (
              <p className="font-arabic-display text-2xl text-primary">{book.titleAr}</p>
            )}
            <p className="text-sm text-muted-foreground">by {book.author}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{book.category}</Badge>
              <Badge className="bg-accent text-accent-foreground">{book.condition}</Badge>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-2 py-0.5 text-xs text-primary">
                <Leaf /> {sellerName(book.sellerId)}
              </span>
            </div>
            <Stars value={avgRating(book)} count={book.reviews.length} />
            <p className="text-sm leading-relaxed">{book.description}</p>
            <p className="rounded-md bg-muted p-3 text-sm">
              <span className="font-semibold">Condition notes: </span>
              {book.conditionNotes}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-2xl text-rust">{egp(book.price)}</span>
              <span
                className={`text-sm ${book.availableQuantity > 0 ? "text-primary" : "text-destructive"}`}
              >
                {book.availableQuantity > 0
                  ? `${book.availableQuantity} copies remaining`
                  : "Out of stock"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={book.availableQuantity === 0}
                onClick={() => {
                  addToCart(book.id);
                  toast.success("Added to your satchel");
                }}
              >
                <ShoppingBasket className="h-4 w-4" /> Add to cart
              </Button>
              <Button variant="outline" onClick={() => toggleWishlist(book.id)}>
                <Heart className={`h-4 w-4 ${wished ? "fill-rust text-rust" : ""}`} />
                {wished ? "Saved" : "Wishlist"}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <section className="space-y-4">
          <h3 className="font-display text-lg tracking-wide">Readers before you</h3>
          {book.reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">No reviews yet for this copy.</p>
          )}
          <ul className="space-y-3">
            {book.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.author}</span>
                  {r.verified && (
                    <Badge variant="secondary" className="text-[0.65rem]">
                      Verified reader
                    </Badge>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                </div>
                <Stars value={r.rating} className="mt-1" />
                <p className="mt-2 text-sm">{r.comment}</p>
              </li>
            ))}
          </ul>

          {canReview ? (
            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <p className="text-sm font-medium">Leave your note for the next reader</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} stars`}
                    onClick={() => setRating(n)}
                  >
                    <Star
                      className={`h-5 w-5 ${n <= rating ? "fill-amber-gold text-amber-gold" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={400}
                placeholder="How did this copy reach you?"
              />
              <Button size="sm" disabled={comment.trim().length < 4} onClick={submitReview}>
                Publish review
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Only customers who have ordered this book can review it.
            </p>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

function Leaf() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
      <path
        d="M2 14C2 7 7 2 14 2c0 7-5 12-12 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
