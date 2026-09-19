import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Hourglass, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BranchDivider } from "@/components/turath/Ornaments";
import { BookCover } from "@/components/turath/BookCover";
import { egp, useTurath } from "@/lib/turath/store";
import type { Book, Condition, OrderStatus } from "@/lib/turath/types";
import { statusTone } from "./orders";

const conditions: Condition[] = ["Acceptable", "Good", "Like New", "Vintage Collector"];
const statuses: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const spines: Book["spine"][] = ["rust", "navy", "amber", "sage", "crimson"];

export const Route = createFileRoute("/seller")({
  head: () => ({
    meta: [
      { title: "Seller Portal — Turath" },
      {
        name: "description",
        content: "Manage your pre-loved book inventory, track revenue and fulfil orders on Turath.",
      },
      { property: "og:title", content: "Seller Portal — Turath" },
      { property: "og:description", content: "Manage inventory and fulfil orders on Turath." },
    ],
  }),
  component: SellerPortal,
});

function SellerPortal() {
  const { role, activeUser, books, orders, categories, saveBook, deleteBook, setOrderStatus } =
    useTurath();
  const [editing, setEditing] = useState<Book | null>(null);
  const isPendingSeller = activeUser?.sellerState === "pending";

  const sellerId = activeUser?.id ?? "";
  const sellerName = activeUser?.name ?? "Seller";

  const myBooks = useMemo(
    () => (sellerId ? books.filter((b) => b.sellerId === sellerId) : []),
    [books, sellerId],
  );
  const myOrders = useMemo(
    () => (sellerId ? orders.filter((o) => o.lines.some((l) => l.sellerId === sellerId)) : []),
    [orders, sellerId],
  );
  const revenue = myOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce(
      (s, o) =>
        s +
        o.lines
          .filter((l) => l.sellerId === sellerId)
          .reduce((n, l) => n + l.price * l.quantity, 0),
      0,
    );

  if (role === "pendingSeller" || isPendingSeller) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="rounded-lg border border-amber-gold/50 bg-amber-gold/10 p-10">
          <Hourglass className="mx-auto h-10 w-10 text-amber-gold" />
          <h1 className="font-display mt-4 text-2xl tracking-wide">Verification in progress</h1>
          <p className="font-arabic-display mt-2 text-xl text-primary">حسابك قيد المراجعة</p>
          <BranchDivider className="my-6" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Thank you, {sellerName}. A steward is reviewing your shop application. Listing
            books, editing inventory and fulfilling orders unlock once you are approved.
          </p>
          <Button className="mt-6" disabled>
            <Plus className="h-4 w-4" /> Add a book (locked)
          </Button>
        </div>
      </div>
    );
  }

  if (role !== "seller") {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl tracking-wide">Seller portal</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Switch the role selector to “Approved Seller” or “Pending Seller” to preview this area.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-3xl tracking-wide">{sellerName}</h1>
        <p className="font-arabic-display mt-1 text-xl text-primary">لوحة البائع</p>
        <BranchDivider className="mt-4" />
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Books listed" value={`${myBooks.length}`} />
        <Metric label="Orders received" value={`${myOrders.length}`} />
        <Metric label="Revenue" value={egp(revenue)} />
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl tracking-wide">Inventory</h2>
          <Button onClick={() => setEditing(blankBook(sellerId, categories[0] ?? "Fiction"))}>
            <Plus className="h-4 w-4" /> Add book
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBooks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <BookCover book={b} className="h-14 w-10 shrink-0" />
                      <div>
                        <p className="font-medium">{b.title}</p>
                        <p className="text-xs text-muted-foreground">{b.author}</p>
                        {b.flagged && (
                          <Badge className="mt-1 bg-destructive/15 text-destructive">Flagged</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{b.category}</TableCell>
                  <TableCell className="text-sm">{b.condition}</TableCell>
                  <TableCell className="text-right tabular-nums">{egp(b.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.availableQuantity}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(b)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete"
                      className="text-destructive"
                      onClick={() => {
                        deleteBook(b.id);
                        toast.success(`${b.title} removed from your shelf`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {myBooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Your shelf is empty. Add your first book.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display mb-3 text-xl tracking-wide">Fulfilment queue</h2>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.lines
                      .filter((l) => l.sellerId === activeUser.id)
                      .map((l) => `${l.title} ×${l.quantity}`)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="text-sm">{o.placedAt}</TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => {
                        setOrderStatus(o.id, v as OrderStatus);
                        toast.success(`${o.id} marked ${v}`);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[150px]" aria-label={`Status for ${o.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {myOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <BookForm
        book={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSave={(b) => {
          saveBook(b);
          setEditing(null);
          toast.success("Listing saved");
        }}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-display mt-1 text-2xl">{value}</p>
    </div>
  );
}

function blankBook(sellerId: string, category: string): Book {
  return {
    id: `b-${Date.now()}`,
    title: "",
    author: "",
    price: 100,
    availableQuantity: 1,
    category,
    condition: "Good",
    description: "",
    conditionNotes: "",
    sellerId,
    spine: "sage",
    images: ["front", "spine"],
    reviews: [],
    flagged: false,
    removed: false,
  };
}

function BookForm({
  book,
  categories,
  onClose,
  onSave,
}: {
  book: Book | null;
  categories: string[];
  onClose: () => void;
  onSave: (b: Book) => void;
}) {
  const [draft, setDraft] = useState<Book | null>(book);
  const [touched, setTouched] = useState(false);

  if (book && draft?.id !== book.id) setDraft(book);
  if (!book || !draft) return null;

  const errors = {
    title: draft.title.trim().length < 2 ? "Title is required." : "",
    author: draft.author.trim().length < 2 ? "Author is required." : "",
    price: draft.price <= 0 ? "Price must be above zero." : "",
    stock: draft.availableQuantity < 0 ? "Stock cannot be negative." : "",
  };
  const valid = Object.values(errors).every((e) => !e);
  const set = (p: Partial<Book>) => setDraft({ ...draft, ...p });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">
            {book.title ? "Edit listing" : "Add a book"}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <Text label="Title" value={draft.title} onChange={(v) => set({ title: v })} error={touched ? errors.title : ""} />
          <Text label="Arabic title (optional)" value={draft.titleAr ?? ""} onChange={(v) => set({ titleAr: v })} />
          <Text label="Author" value={draft.author} onChange={(v) => set({ author: v })} error={touched ? errors.author : ""} />
          <div className="grid grid-cols-2 gap-3">
            <Text
              label="Price (EGP)"
              type="number"
              value={String(draft.price)}
              onChange={(v) => set({ price: Number(v) })}
              error={touched ? errors.price : ""}
            />
            <Text
              label="Stock"
              type="number"
              value={String(draft.availableQuantity)}
              onChange={(v) => set({ availableQuantity: Math.max(0, Number(v)) })}
              error={touched ? errors.stock : ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Picker
              label="Category"
              value={draft.category}
              options={categories}
              onChange={(v) => set({ category: v })}
            />
            <Picker
              label="Condition"
              value={draft.condition}
              options={conditions}
              onChange={(v) => set({ condition: v as Condition })}
            />
          </div>
          <Picker
            label="Cover cloth"
            value={draft.spine}
            options={spines}
            onChange={(v) => set({ spine: v as Book["spine"] })}
          />
          <div className="space-y-1.5">
            <Label htmlFor="bf-desc">Description</Label>
            <Textarea id="bf-desc" value={draft.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bf-notes">Condition notes</Label>
            <Textarea id="bf-notes" value={draft.conditionNotes} onChange={(e) => set({ conditionNotes: e.target.value })} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTouched(true);
              if (valid) onSave(draft);
            }}
          >
            Save listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Text({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}) {
  const id = `bf-${label.replace(/\W/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Picker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const id = `bf-${label.replace(/\W/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
