import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserRound, MapPin, Phone, BookOpen, Store, Pencil, MessageSquare, Plus, CheckCircle2, Clock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type CustomerTicket = {
  id: number;
  subject: string;
  message: string;
  status: string | number;
  adminResponse?: string;
  orderId?: string;
  createdAt: string;
};

function Account() {
  const { activeUser, isAuthenticated, updateProfile, syncCurrentUserProfile, signOut } = useTurath();
  const [editOpen, setEditOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketOrderId, setTicketOrderId] = useState("");
  const [myTickets, setMyTickets] = useState<CustomerTicket[]>([]);

  const loadTickets = () => {
    if (!isAuthenticated) return;
    void apiFetch<CustomerTicket[]>("/api/support-tickets")
      .then((tickets) => setMyTickets(tickets))
      .catch(() => setMyTickets([]));
  };

  useEffect(() => {
    if (isAuthenticated) {
      void syncCurrentUserProfile();
      loadTickets();
    }
  }, [isAuthenticated, syncCurrentUserProfile]);

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    try {
      await apiFetch("/api/support-tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          message: ticketMessage.trim(),
          orderId: ticketOrderId.trim() ? ticketOrderId.trim() : undefined,
        }),
      });
      toast.success("Support ticket submitted. A steward will respond shortly.");
      setTicketSubject("");
      setTicketMessage("");
      setTicketOrderId("");
      setTicketModalOpen(false);
      loadTickets();
    } catch (error) {
      toast.error("Failed to submit support ticket.");
    }
  };

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

  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone ?? "");
  const [editAddress, setEditAddress] = useState(user.address ?? "");
  const [editGenres, setEditGenres] = useState(user.genres?.join(", ") ?? "");
  const [editStoreName, setEditStoreName] = useState(user.storeName ?? "");
  const [editBio, setEditBio] = useState(user.bio ?? "");

  const isSeller = user.role === "seller" || user.sellerState === "approved";
  const roleBadgeText = user.role === "admin" ? "Admin" : isSeller ? "Seller" : "Customer";
  const sellerRequestPending = user.sellerState === "pending";
  const displayName = isAuthenticated ? user.name : "Guest Reader";
  const displayEmail = isAuthenticated ? user.email : "guest@example.com";

  const openEditModal = () => {
    setEditName(user.name);
    setEditPhone(user.phone ?? "");
    setEditAddress(user.address ?? "");
    setEditGenres(user.genres?.join(", ") ?? "");
    setEditStoreName(user.storeName ?? "");
    setEditBio(user.bio ?? "");
    setEditOpen(true);
  };

  const handleSaveProfile = () => {
    if (!isAuthenticated || !activeUser) return;

    updateProfile(activeUser.id, {
      name: editName.trim() || activeUser.name,
      phone: editPhone.trim() || undefined,
      address: editAddress.trim() || undefined,
      genres: editGenres.split(",").map((g) => g.trim()).filter(Boolean),
      ...(isSeller ? { storeName: editStoreName.trim() || undefined, bio: editBio.trim() || undefined } : {}),
    });

    setEditOpen(false);
    toast.success("Account details saved successfully.");
  };

  const handleSellerRequest = async () => {
    if (!isAuthenticated || !activeUser) {
      toast.error("Sign in first to request seller access.");
      return;
    }

    try {
      const data = await apiFetch<{ message?: string }>("/api/SellerRequests/apply", {
        method: "POST",
        body: JSON.stringify({
          userId: activeUser.id,
          email: activeUser.email,
        }),
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent font-display text-2xl text-accent-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-2xl">{displayName}</h2>
                <Badge variant="outline">{roleBadgeText}</Badge>
                {!isAuthenticated && <Badge className="bg-amber-gold/25 text-foreground">Guest profile</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{displayEmail}</p>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex flex-wrap items-center gap-2">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={openEditModal} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile Details</DialogTitle>
                    <DialogDescription>
                      Update your contact number, delivery address, and preferences.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3.5 py-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="e.g. 01012345678" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="address">{isSeller ? "Store Location" : "Default Shipping Address"}</Label>
                      <Input id="address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="e.g. 12 Al-Mu'izz St, Cairo" />
                    </div>
                    {!isSeller ? (
                      <div className="space-y-1.5">
                        <Label htmlFor="genres">Preferred Genres</Label>
                        <Input id="genres" value={editGenres} onChange={(e) => setEditGenres(e.target.value)} placeholder="e.g. Fiction, History, Philosophy" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="storeName">Store Display Name</Label>
                          <Input id="storeName" value={editStoreName} onChange={(e) => setEditStoreName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="bio">Store Bio</Label>
                          <Textarea id="bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} />
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut();
                  toast.success("Signed out successfully");
                }}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          )}
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

      {/* CUSTOMER SUPPORT TICKETS SECTION */}
      {isAuthenticated && (
        <section className="mt-8 rounded-lg border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl tracking-wide">Customer Support</h3>
              <p className="text-xs text-muted-foreground">Need help with an order, delivery, or book inquiry? Submit a ticket.</p>
            </div>
            <Button size="sm" onClick={() => setTicketModalOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {myTickets.map((t) => (
              <div key={t.id} className="rounded-lg border bg-background p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{t.subject}</span>
                    <Badge variant={t.adminResponse ? "secondary" : "outline"} className={t.adminResponse ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}>
                      {t.adminResponse ? "Resolved" : "Under Review"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.message}</p>
                {t.adminResponse && (
                  <div className="mt-3 rounded border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
                    <p className="font-semibold">Steward Response:</p>
                    <p className="mt-1">{t.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
            {!myTickets.length && (
              <p className="text-center py-6 text-sm text-muted-foreground">You have no open support tickets.</p>
            )}
          </div>

          <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Support Ticket</DialogTitle>
                <DialogDescription>
                  Send a message to our stewards. We will respond directly to your ticket.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5 py-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t-subject">Subject</Label>
                  <Input
                    id="t-subject"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Question regarding delivery time"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="t-order">Order ID (optional)</Label>
                  <Input
                    id="t-order"
                    value={ticketOrderId}
                    onChange={(e) => setTicketOrderId(e.target.value)}
                    placeholder="e.g. ord-12345"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="t-msg">Message</Label>
                  <Textarea
                    id="t-msg"
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe what you need assistance with..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTicketModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitTicket} disabled={!ticketSubject.trim() || !ticketMessage.trim()}>
                  Submit Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      )}
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
