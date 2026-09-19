import { createFileRoute } from "@tanstack/react-router";
import { UserRound, MapPin, Phone, BookOpen, Store } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BranchDivider } from "@/components/turath/Ornaments";
import { useTurath } from "@/lib/turath/store";
import { apiFetch } from "@/lib/turath/api";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Turath" },
      { name: "description", content: "View your Turath account details and reading preferences." },
    ],
  }),
  component: Account,
});

function Account() {
  const { activeUser, isAuthenticated, updateProfile } = useTurath();
  const user = activeUser ?? {
    id: "",
    name: "Guest Reader",
    email: "guest@example.com",
    role: "customer" as const,
    joined: "Today",
    status: "active" as const,
    phone: undefined,
    address: undefined,
    storeName: undefined,
    genres: [],
    bio: undefined,
    sellerState: undefined,
  };

  const isSeller = user.role === "seller";
  const sellerRequestPending = user.sellerState === "pending";
  const displayName = isAuthenticated ? user.name : "Guest Reader";
  const displayEmail = isAuthenticated ? user.email : "guest@example.com";

  const handleSellerRequest = async () => {
    if (!isAuthenticated || !activeUser) {
      toast.error("Sign in first to request seller access.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Your session is not active. Please sign in again.");
      return;
    }

    try {
      const data = await apiFetch<{ message?: string }>("/api/SellerRequests/apply", {
        method: "POST",
      });

      updateProfile(activeUser.id, { sellerState: "pending" });
      toast.success(data?.message || "Seller request submitted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit seller request.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-3xl tracking-wide">My Account</h1>
        <p className="font-arabic-display mt-1 text-xl text-primary">حسابي</p>
        <BranchDivider className="mt-4" />
      </header>

      {!isAuthenticated && (
        <div className="mt-6 rounded-lg border border-primary/20 bg-accent/30 p-4 text-center">
          <p className="text-sm font-medium">You are currently exploring as a guest.</p>
          <p className="mt-1 text-xs text-muted-foreground">Sign in to view your orders, wishlist, and profile details.</p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("turath:open-auth"))}
            className="mt-3 inline-flex items-center rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            Sign In / Create Account
          </button>
        </div>
      )}

      <section className="mt-8 rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent font-display text-2xl text-accent-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-2xl">{displayName}</h2>
              <Badge variant="outline">{isSeller ? "Seller" : "Customer"}</Badge>
              {!isAuthenticated && <Badge className="bg-amber-gold/25 text-foreground">Guest profile</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{displayEmail}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <Detail icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone ?? "Not added yet"} />
          <Detail icon={<MapPin className="h-4 w-4" />} label={isSeller ? "Store location" : "Default address"} value={user.address ?? "Not added yet"} />
          {isSeller ? (
            <Detail icon={<Store className="h-4 w-4" />} label="Store name" value={user.storeName ?? user.name} />
          ) : (
            <Detail icon={<BookOpen className="h-4 w-4" />} label="Preferred genres" value={user.genres?.join(", ") || "Not added yet"} />
          )}
          <Detail icon={<UserRound className="h-4 w-4" />} label="Member since" value={user.joined} />
        </div>

        {isAuthenticated && !isSeller && (
          <div className="mt-6">
            {sellerRequestPending ? (
              <Badge className="bg-amber-100 text-amber-900">Seller request pending</Badge>
            ) : (
              <button
                type="button"
                onClick={handleSellerRequest}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Request to be a seller
              </button>
            )}
          </div>
        )}

        {isSeller && (
          <div className="mt-6 rounded-md bg-muted p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">Store bio</p>
            <p className="mt-2 text-sm leading-relaxed">{user.bio || "No store bio added yet."}</p>
            {user.sellerState && <p className="mt-3 text-xs text-muted-foreground">Seller status: {user.sellerState}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-1 break-words text-sm">{value}</p>
      </div>
    </div>
  );
}
