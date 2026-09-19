import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBasket, RotateCcw } from "lucide-react";
import emblem from "@/assets/turath-emblem.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CartSheet } from "./CartSheet";
import { ChatWidget } from "./ChatWidget";
import { AuthBadge, AuthSheet } from "./AuthSheet";
import { BookCover } from "./BookCover";
import { BranchDivider } from "./Ornaments";
import { egp, roleLabels, useTurath } from "@/lib/turath/store";
import type { Role } from "@/lib/turath/types";

const navFor: Record<Role, { to: string; label: string }[]> = {
  customer: [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/account", label: "Account" },
  ],
  seller: [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/seller", label: "Seller Portal" },
    { to: "/account", label: "Account" },
  ],
  pendingSeller: [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/seller", label: "Seller Portal" },
    { to: "/account", label: "Account" },
  ],
  admin: [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/account", label: "Account" },
  ],
};

export function Layout({ children }: { children: ReactNode }) {
  const { role, isAuthenticated, cart, wishlist, bookById, toggleWishlist, resetAll, activeUser } = useTurath();
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const safeRole = role ?? "customer";
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  useEffect(() => {
    const openAuth = () => setAuthOpen(true);
    window.addEventListener("turath:open-auth", openAuth);
    return () => window.removeEventListener("turath:open-auth", openAuth);
  }, []);
  const cartCount = safeCart.reduce((s, c) => s + (Number(c?.quantity) || 0), 0);
  const navigation =
    safeRole === "customer" && isAuthenticated
      ? [...navFor[safeRole].slice(0, 2), { to: "/orders", label: "My Orders" }, ...navFor[safeRole].slice(2)]
      : navFor[safeRole];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={emblem} alt="" width={1024} height={1024} className="h-10 w-10 object-contain" />
            <span className="leading-none">
              <span className="block font-display text-lg tracking-[0.2em] uppercase">Turath</span>
              <span className="font-arabic-display block text-sm text-primary">تراث</span>
            </span>
          </Link>

          <nav className="order-3 flex w-full gap-1 overflow-x-auto md:order-none md:w-auto md:pl-6">
            {navigation.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                className="rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <AuthBadge onClick={() => setAuthOpen(true)} />

            <Button
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              className="relative"
              onClick={() => setWishOpen(true)}
            >
              <Heart className="h-5 w-5" />
              {safeWishlist.length > 0 && <Dot>{safeWishlist.length}</Dot>}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBasket className="h-5 w-5" />
              {cartCount > 0 && <Dot>{cartCount}</Dot>}
            </Button>
          </div>
        </div>

      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t bg-ivory/60 px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-4 text-center">
          <BranchDivider />
          <p className="font-arabic-display text-2xl text-primary">أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً</p>
          <p className="text-sm text-muted-foreground">
            Turath · a marketplace for pre-loved and recycled books.
            {isAuthenticated ? (
              <>
                {" "}Signed in as <span className="font-medium text-foreground">{activeUser.name}</span> ({roleLabels[safeRole].en}).
              </>
            ) : (
              <>
                {" "}Join us and start your reading journey.
              </>
            )}
          </p>
          <Button variant="outline" size="sm" onClick={resetAll}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
          </Button>
        </div>
      </footer>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      <AuthSheet open={authOpen} onOpenChange={setAuthOpen} />

      <Sheet open={wishOpen} onOpenChange={setWishOpen}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="font-display tracking-wide">Wishlist</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto px-4 pb-6">
            {safeWishlist.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing saved yet.</p>
            )}
            {safeWishlist.map((id) => {
              const b = bookById(id);
              if (!b) return null;
              return (
                <div key={id} className="flex gap-3">
                  <BookCover book={b} className="h-24 w-16 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author}</p>
                    <p className="text-sm text-rust">{egp(b.price)}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1 h-7 px-2 text-xs text-destructive"
                      onClick={() => toggleWishlist(id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <ChatWidget />
    </div>
  );
}

function Dot({ children }: { children: ReactNode }) {
  return (
    <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full bg-rust px-1 text-[0.6rem] text-background">
      {children}
    </Badge>
  );
}
