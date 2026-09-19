import { Heart, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookCover } from "./BookCover";
import { Stars } from "./Stars";
import { avgRating, egp, useTurath } from "@/lib/turath/store";
import type { Book } from "@/lib/turath/types";

export function BookCard({ book, onOpen }: { book: Book; onOpen: (b: Book) => void }) {
  const { addToCart, toggleWishlist, wishlist, sellerName } = useTurath();
  const wished = wishlist.includes(book.id);

  // Read direct sellerName from API, fallback to the updated store lookup
  const displaySeller = (book as any).sellerName || sellerName(book.sellerId, (book as any).sellerName);

  return (
    <article className="card-antique group flex flex-col overflow-hidden">
      <button
        onClick={() => onOpen(book)}
        className="relative block bg-ivory p-5 text-left"
        aria-label={`Open details for ${book.title}`}
      >
        <BookCover
          book={book}
          className="mx-auto aspect-[3/4] w-full max-w-[190px] transition-transform duration-300 group-hover:-rotate-1"
        />
        <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
          {book.condition}
        </Badge>
        {book.availableQuantity === 0 && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
            Out of stock
          </Badge>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 border-t p-4">
        <div>
          <h3 className="font-serif text-base leading-tight font-semibold">{book.title}</h3>
          <p className="text-xs text-muted-foreground">{book.author}</p>
        </div>
        <Stars value={avgRating(book)} count={book.reviews?.length ?? 0} />
        <p className="text-xs text-muted-foreground">
          {book.category} · {displaySeller}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="font-display text-lg text-rust">{egp(book.price)}</span>
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto h-8 w-8"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggleWishlist(book.id)}
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-rust text-rust" : ""}`} />
          </Button>
          <Button
            size="sm"
            disabled={book.availableQuantity === 0}
            onClick={() => {
              addToCart(book.id);
              toast.success(`${book.title} added`);
            }}
          >
            <ShoppingBasket className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}