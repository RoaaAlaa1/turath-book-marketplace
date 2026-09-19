import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Eye, Flag, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BranchDivider } from "@/components/turath/Ornaments";
import { egp, roleLabels, useTurath } from "@/lib/turath/store";
import type { Order } from "@/lib/turath/types";
import { statusTone } from "./orders";
import { apiFetch } from "@/lib/turath/api";

type SellerRequest = { id: number; userId: string; userEmail: string; status: string; requestedAt: string };

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Stewardship — Turath" },
      { name: "description", content: "Oversee sellers, books, users, categories and orders on Turath." },
    ],
  }),
  component: AdminPortal,
});

function AdminPortal() {
  const {
    users,
    books,
    orders,
    categories,
    setUserStatus,
    decideSeller,
    toggleFlag,
    toggleRemoved,
    addCategory,
    renameCategory,
    removeCategory,
  } = useTurath();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);

  const customers = users.filter((u) => u.role === "customer");
  const sellers = users.filter((u) => u.role === "seller");
  const pendingSellers = users.filter((u) => u.sellerState === "pending");
  const activeBooks = books.filter((b) => !b.removed);
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const flaggedBooks = books.filter((b) => b.flagged || b.removed);
  const sellerName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown seller";

  useEffect(() => {
    void apiFetch<SellerRequest[]>("/api/SellerRequests?status=Pending")
      .then((requests) => setSellerRequests(requests))
      .catch(() => setSellerRequests([]));
  }, []);

  const decideServerSellerRequest = async (request: SellerRequest, decision: "approve" | "reject") => {
    try {
      await apiFetch(`/api/SellerRequests/${request.id}/${decision}`, { method: "POST" });
      setSellerRequests((requests) => requests.filter((item) => item.id !== request.id));
      decideSeller(request.userId, decision === "approve" ? "approved" : "rejected");
      toast.success(`${request.userEmail} ${decision}d`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to process seller request.");
    }
  };
  const metrics = [
    ["Customers", customers.length],
    ["Sellers", sellers.length],
    ["Products", activeBooks.length],
    ["Orders", orders.length],
    ["Pending queue", pendingOrders.length],
  ] as const;

  const addNewCategory = () => {
    const clean = newCategory.trim();
    if (!clean || categories.includes(clean)) {
      toast.error("Enter a unique category name");
      return;
    }
    addCategory(clean);
    setNewCategory("");
    toast.success("Category added");
  };

  const saveCategory = (oldName: string) => {
    const clean = categoryDraft.trim();
    if (!clean || (clean !== oldName && categories.includes(clean))) {
      toast.error("Enter a unique category name");
      return;
    }
    renameCategory(oldName, clean);
    setEditingCategory(null);
    toast.success("Category renamed");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="text-center">
        <p className="text-xs tracking-[0.35em] text-muted-foreground uppercase">Turath Stewardship</p>
        <h1 className="font-display mt-2 text-3xl tracking-wide">The Keeper’s Desk</h1>
        <p className="font-arabic-display mt-1 text-xl text-primary">لوحة المشرف</p>
        <BranchDivider className="mt-4" />
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
            <p className="font-display mt-1 text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <SectionHeading title="Seller approval desk" count={sellerRequests.length || pendingSellers.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Applicant</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Decision</TableHead></TableRow></TableHeader>
            <TableBody>
              {sellerRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell><p className="font-medium">{request.userEmail}</p><p className="text-xs text-muted-foreground">{request.userId}</p></TableCell>
                  <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell><Badge className="bg-amber-gold/25 text-foreground">Pending review</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => void decideServerSellerRequest(request, "approve")}><Check className="h-4 w-4" /> Approve</Button>
                    <Button size="sm" variant="ghost" className="ml-1 text-destructive" onClick={() => void decideServerSellerRequest(request, "reject")}><X className="h-4 w-4" /> Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!sellerRequests.length && pendingSellers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></TableCell>
                  <TableCell>{user.joined}</TableCell>
                  <TableCell><Badge className="bg-amber-gold/25 text-foreground">Pending review</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => { decideSeller(user.id, "approved"); toast.success(`${user.name} approved`); }}><Check className="h-4 w-4" /> Approve</Button>
                    <Button size="sm" variant="ghost" className="ml-1 text-destructive" onClick={() => { decideSeller(user.id, "rejected"); toast.success(`${user.name} rejected`); }}><X className="h-4 w-4" /> Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!sellerRequests.length && !pendingSellers.length && <EmptyRow colSpan={4} text="No seller applications are waiting." />}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading title="User control" count={users.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Access</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></TableCell>
                  <TableCell>{roleLabels[user.role].en}</TableCell>
                  <TableCell>{user.joined}</TableCell>
                  <TableCell><Badge className={user.status === "active" ? "bg-sage/25 text-primary" : "bg-destructive/15 text-destructive"}>{user.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => { const next = user.status === "active" ? "suspended" : "active"; setUserStatus(user.id, next); toast.success(`${user.name} ${next}`); }}>
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading title="Product moderation" count={flaggedBooks.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Listing</TableHead><TableHead>Seller</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}<p className="text-xs font-normal text-muted-foreground">{egp(book.price)}</p></TableCell>
                  <TableCell>{sellerName(book.sellerId)}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>{book.removed ? <Badge className="bg-destructive/15 text-destructive">Removed</Badge> : book.flagged ? <Badge className="bg-amber-gold/25 text-foreground">Flagged</Badge> : <Badge className="bg-sage/25 text-primary">Clear</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" aria-label={book.flagged ? "Clear flag" : "Flag listing"} onClick={() => { toggleFlag(book.id); toast.success(book.flagged ? "Flag cleared" : "Listing flagged"); }}><Flag className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => { toggleRemoved(book.id); toast.success(book.removed ? "Listing restored" : "Listing removed"); }}>{book.removed ? "Restore" : "Remove"}</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <section>
          <SectionHeading title="Categories" count={categories.length} />
          <div className="rounded-lg border bg-card p-4">
            <div className="flex gap-2">
              <Label htmlFor="new-category" className="sr-only">New category</Label>
              <Input id="new-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category" onKeyDown={(e) => e.key === "Enter" && addNewCategory()} />
              <Button size="icon" aria-label="Add category" onClick={addNewCategory}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2 border-b pb-2 last:border-0 last:pb-0">
                  {editingCategory === category ? <Input value={categoryDraft} onChange={(e) => setCategoryDraft(e.target.value)} autoFocus /> : <span className="flex-1 text-sm">{category}</span>}
                  {editingCategory === category ? <Button size="icon" variant="ghost" aria-label="Save category" onClick={() => saveCategory(category)}><Check className="h-4 w-4" /></Button> : <Button size="icon" variant="ghost" aria-label={`Rename ${category}`} onClick={() => { setEditingCategory(category); setCategoryDraft(category); }}><Pencil className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" aria-label={`Remove ${category}`} className="text-destructive" onClick={() => { removeCategory(category); toast.success("Category removed"); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading title="Master order overview" count={orders.length} />
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">View</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}><TableCell className="font-medium">{order.id}<p className="text-xs font-normal text-muted-foreground">{order.placedAt}</p></TableCell><TableCell>{order.customerName}</TableCell><TableCell>{egp(order.total)}</TableCell><TableCell><Badge className={statusTone[order.status]}>{order.status}</Badge></TableCell><TableCell className="text-right"><Button size="icon" variant="ghost" aria-label={`View ${order.id}`} onClick={() => setSelectedOrder(order)}><Eye className="h-4 w-4" /></Button></TableCell></TableRow>
                ))}
                {!orders.length && <EmptyRow colSpan={5} text="No orders have been placed." />}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      <OrderDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return <div className="mb-3 flex items-center gap-2"><h2 className="font-display text-xl tracking-wide">{title}</h2><Badge variant="outline">{count}</Badge></div>;
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return <TableRow><TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">{text}</TableCell></TableRow>;
}

function OrderDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}><DialogContent><DialogHeader><DialogTitle className="font-display tracking-wide">Order {order?.id}</DialogTitle></DialogHeader>{order && <div className="space-y-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><span>{order.customerName}</span><Badge className={statusTone[order.status]}>{order.status}</Badge></div><p className="text-muted-foreground">Ships to {order.address}</p><div className="space-y-2 border-y py-4">{order.lines.map((line) => <div key={line.bookId} className="flex justify-between gap-3"><span>{line.title} × {line.quantity}</span><span>{egp(line.price * line.quantity)}</span></div>)}</div><div className="flex justify-between font-semibold"><span>Total</span><span>{egp(order.total)}</span></div></div>}</DialogContent></Dialog>;
}
