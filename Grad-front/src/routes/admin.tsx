import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Check, Eye, Flag, MessageSquare, Pencil, Plus, Search, Trash2, X, ChevronDown, ChevronRight, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { egp, roleLabels, useTurath, USER_FALLBACK_MAP } from "@/lib/turath/store";
import type { Order, Book, OrderStatus } from "@/lib/turath/types";
import { statusTone } from "./orders";
import { apiFetch } from "@/lib/turath/api";
import { BookCover } from "@/components/turath/BookCover";

type SellerRequest = { id: number; userId: string; userEmail: string; userName?: string; status: string; requestedAt: string };
type CategoryRequestItem = { id: string; categoryName: string; sellerId: string; sellerName?: string; sellerEmail?: string; requestedAt: string; status: string };
type SupportTicketItem = {
  id: number;
  subject: string;
  message: string;
  status: string | number;
  adminResponse?: string;
  orderId?: string;
  customerEmail?: string;
  createdAt: string;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Stewardship — Turath" },
      { name: "description", content: "Oversee sellers, books, users, categories, support tickets and orders on Turath." },
    ],
  }),
  component: AdminPortal,
});

function AdminPortal() {
  const {
    role,
    activeUser,
    isAuthenticated,
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
    setOrderStatus,
    decideBook,
    syncOrdersFromServer,
  } = useTurath();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [sellerRequests, setSellerRequests] = useState<SellerRequest[]>([]);
  const [categoryRequests, setCategoryRequests] = useState<CategoryRequestItem[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  const [replyTicket, setReplyTicket] = useState<SupportTicketItem | null>(null);
  const [adminResponseText, setAdminResponseText] = useState("");
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminPendingBooks, setAdminPendingBooks] = useState<Book[]>([]);
  const [adminAllBooks, setAdminAllBooks] = useState<Book[]>([]);

  const mapAdminBook = (b: any): Book => ({
    id: String(b.id),
    title: b.title ?? "Untitled",
    titleAr: b.titleAr,
    author: b.author ?? "Unknown",
    price: Number(b.price ?? 0),
    availableQuantity: Number(b.quantity ?? b.availableQuantity ?? 0),
    category: b.categoryName ?? b.category ?? "General",
    condition: (b.condition ?? "Good") as Book["condition"],
    description: b.description ?? "",
    conditionNotes: b.conditionNotes ?? "",
    sellerId: b.sellerId ?? "",
    sellerName: b.sellerName || (b.sellerEmail ? b.sellerEmail.split("@")[0] : "Verified Seller"),
    spine: b.spine ?? "sage",
    images: [b.imageUrl ?? ""].filter(Boolean),
    imageUrl: b.imageUrl ?? "",
    reviews: b.reviews ?? [],
    flagged: Boolean(b.flagged),
    removed: Boolean(b.removed),
    ageRating: b.ageRating || "All Ages",
    approvalStatus: b.approvalStatus ?? "Pending",
  });

  // Books filtering & accordion
  const [bookCategoryFilter, setBookCategoryFilter] = useState<string>("ALL");
  const [bookSearch, setBookSearch] = useState("");
  const [bookViewMode, setBookViewMode] = useState<"accordion" | "table">("accordion");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const isAdmin =
    role === "admin" ||
    activeUser?.role === "admin" ||
    Boolean(activeUser?.email?.toLowerCase().startsWith("admin@turath.")) ||
    (typeof localStorage !== "undefined" && (localStorage.getItem("turath-email")?.toLowerCase().startsWith("admin@turath.") ?? false));

  const loadData = () => {
    void syncOrdersFromServer();

    void apiFetch<SellerRequest[]>("/api/SellerRequests?status=Pending")
      .then((reqs) => setSellerRequests(reqs))
      .catch(() => setSellerRequests([]));

    void apiFetch<CategoryRequestItem[]>("/api/Admin/category-requests")
      .then((reqs) => setCategoryRequests(reqs))
      .catch(() => setCategoryRequests([]));

    void apiFetch<SupportTicketItem[]>("/api/admin/support-tickets")
      .then((tickets) => setSupportTickets(tickets))
      .catch(() => setSupportTickets([]));

    void apiFetch<any[]>("/api/Admin/users")
      .then((u) => setAdminUsers(u))
      .catch(() => setAdminUsers([]));

    void apiFetch<any[]>("/api/Admin/books/pending")
      .then((data) => setAdminPendingBooks(Array.isArray(data) ? data.map(mapAdminBook) : []))
      .catch(() => setAdminPendingBooks([]));

    void apiFetch<any[]>("/api/Admin/books")
      .then((data) => setAdminAllBooks(Array.isArray(data) ? data.map(mapAdminBook) : []))
      .catch(() => setAdminAllBooks([]));
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="font-display mt-4 text-2xl tracking-wide text-destructive">403 Access Denied</h1>
          <p className="font-arabic-display mt-2 text-xl text-primary">غير مصرح بالدخول</p>
          <BranchDivider className="my-6" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            You do not have administrative privileges to view the Keeper’s Stewardship Desk. This area is reserved exclusively for platform administrators.
          </p>
          <div className="mt-6">
            <Button onClick={() => { window.location.href = "/"; }}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAdminOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    try {
      await apiFetch(`/api/Orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Order ${orderId} updated to ${newStatus}`);
      void syncOrdersFromServer();
    } catch {
      toast.error("Failed to update status on server.");
    }
  };

  const decideServerSellerRequest = async (request: SellerRequest, decision: "approve" | "reject") => {
    try {
      await apiFetch(`/api/SellerRequests/${request.id}/${decision}`, { method: "POST" });
      setSellerRequests((requests) => requests.filter((item) => item.id !== request.id));
      const stateDecision = decision === "approve" ? "approved" : "rejected";
      decideSeller(request.userId, stateDecision);
      if (request.userEmail && request.userEmail !== request.userId) {
        decideSeller(request.userEmail, stateDecision);
      }
      toast.success(`${request.userEmail} ${decision}d`);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to process seller request.");
    }
  };

  const decideCategoryRequest = async (id: string, decision: "approve" | "reject", catName: string) => {
    try {
      await apiFetch(`/api/Admin/category-requests/${id}/${decision}`, { method: "POST" });
      setCategoryRequests((prev) => prev.filter((r) => r.id !== id));
      if (decision === "approve") {
        addCategory(catName);
        toast.success(`Category "${catName}" approved and added.`);
      } else {
        toast.success(`Category request "${catName}" rejected.`);
      }
    } catch (error) {
      toast.error("Failed to process category request.");
    }
  };

  const decideBookApproval = async (bookId: string, decision: "approve" | "reject") => {
    const nextStatus = decision === "approve" ? "Approved" : "Rejected";
    try {
      const numId = parseInt(bookId.replace(/\D/g, ""), 10);
      if (!isNaN(numId) && numId > 0) {
        await apiFetch(`/api/Admin/books/${numId}/${decision}`, { method: "POST" });
      }
      setAdminPendingBooks((prev) => prev.filter((b) => b.id !== bookId));
      decideBook(bookId, nextStatus);
      toast.success(`Book ${decision}d successfully.`);
      loadData();
    } catch {
      decideBook(bookId, nextStatus);
      toast.success(`Book ${decision}d in catalog.`);
      loadData();
    }
  };

  const handleReplyTicket = async () => {
    if (!replyTicket || !adminResponseText.trim()) return;
    try {
      await apiFetch(`/api/admin/support-tickets/${replyTicket.id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: 2, // Resolved
          adminResponse: adminResponseText.trim(),
        }),
      });
      toast.success(`Reply sent and ticket #${replyTicket.id} marked Resolved.`);
      setReplyTicket(null);
      setAdminResponseText("");
      loadData();
    } catch (error) {
      toast.error("Failed to send response.");
    }
  };

  const displayUsers = adminUsers.length > 0 ? adminUsers : users;
  const customers = displayUsers.filter((u) => u.role === "customer");
  const sellers = displayUsers.filter((u) => u.role === "seller");
  const pendingSellers = displayUsers.filter((u) => u.sellerState === "pending");
  const catalogBooks = adminAllBooks.length > 0 ? adminAllBooks : books;
  const activeBooks = catalogBooks.filter((b) => !b.removed);
  const pendingBooks = adminPendingBooks.length > 0
    ? adminPendingBooks
    : books.filter((b) => b.approvalStatus === "Pending");
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const flaggedBooks = catalogBooks.filter((b) => b.flagged || b.removed);

  const getSellerName = (sellerId: string, directName?: string) => {
    if (directName && directName !== "Unknown Seller") return directName;
    const user = displayUsers.find((u) => u.id === sellerId || u.email === sellerId);
    if (user?.name) return user.name;
    if (USER_FALLBACK_MAP[sellerId]) return USER_FALLBACK_MAP[sellerId];
    return "Verified Seller";
  };

  const filteredBooks = useMemo(() => {
    return catalogBooks.filter((b) => {
      const matchCat = bookCategoryFilter === "ALL" || b.category === bookCategoryFilter;
      const matchSearch =
        !bookSearch.trim() ||
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        getSellerName(b.sellerId, b.sellerName).toLowerCase().includes(bookSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [catalogBooks, bookCategoryFilter, bookSearch, displayUsers]);

  const booksByCategory = useMemo(() => {
    const map: Record<string, Book[]> = {};
    for (const b of filteredBooks) {
      const cat = b.category || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(b);
    }
    return map;
  }, [filteredBooks]);

  const toggleCategoryAccordion = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const metrics = [
    ["Customers", customers.length],
    ["Sellers", sellers.length],
    ["Products", activeBooks.length],
    ["Orders", orders.length],
    ["Support Tickets", supportTickets.length],
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

      {/* 1. SELLER APPLICATIONS */}
      <section className="mt-10">
        <SectionHeading title="Seller Approval Desk" count={sellerRequests.length || pendingSellers.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellerRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <p className="font-medium">{request.userName || getSellerName(request.userId)}</p>
                    <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                  </TableCell>
                  <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell><Badge className="bg-amber-gold/25 text-foreground">Pending review</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => void decideServerSellerRequest(request, "approve")}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-1 text-destructive" onClick={() => void decideServerSellerRequest(request, "reject")}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!sellerRequests.length && pendingSellers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell>{user.joined}</TableCell>
                  <TableCell><Badge className="bg-amber-gold/25 text-foreground">Pending review</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => { decideSeller(user.id, "approved"); toast.success(`${user.name} approved`); }}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-1 text-destructive" onClick={() => { decideSeller(user.id, "rejected"); toast.success(`${user.name} rejected`); }}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!sellerRequests.length && !pendingSellers.length && <EmptyRow colSpan={4} text="No seller applications waiting." />}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 2. PENDING BOOK APPROVALS QUEUE */}
      <section className="mt-10">
        <SectionHeading title="Pending Book Approvals" count={pendingBooks.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingBooks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="h-12 w-9 rounded object-cover shadow-sm shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <BookCover book={b} className="h-12 w-9 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{b.title}</p>
                        <p className="text-xs text-muted-foreground">{b.author}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{getSellerName(b.sellerId, b.sellerName)}</p>
                  </TableCell>
                  <TableCell>{b.category}</TableCell>
                  <TableCell>{egp(b.price)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => void decideBookApproval(b.id, "approve")}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-1 text-destructive" onClick={() => void decideBookApproval(b.id, "reject")}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!pendingBooks.length && <EmptyRow colSpan={5} text="No books are pending approval." />}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 3. CATEGORY SUGGESTIONS QUEUE */}
      <section className="mt-10">
        <SectionHeading title="Category Requests from Sellers" count={categoryRequests.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suggested Category</TableHead>
                <TableHead>Requested By (Seller)</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-semibold text-primary">{req.categoryName}</TableCell>
                  <TableCell>
                    <p className="font-medium">{getSellerName(req.sellerId, req.sellerName)}</p>
                    {req.sellerEmail ? (
                      <p className="text-xs text-muted-foreground">{req.sellerEmail}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Verified Seller</p>
                    )}
                  </TableCell>
                  <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => void decideCategoryRequest(req.id, "approve", req.categoryName)}>
                      <Check className="h-4 w-4" /> Approve & Add
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-1 text-destructive" onClick={() => void decideCategoryRequest(req.id, "reject", req.categoryName)}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!categoryRequests.length && <EmptyRow colSpan={4} text="No pending category requests." />}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 4. PRODUCT CATALOG — COLLAPSIBLE / DROPDOWN SELECTOR (Requirement 8 & 9) */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionHeading title="Catalog & Product Moderation" count={filteredBooks.length} />
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title/author..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
            <Select value={bookCategoryFilter} onValueChange={setBookCategoryFilter}>
              <SelectTrigger className="w-44 h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories ({books.length})</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c} ({books.filter((b) => b.category === c).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={() => setBookViewMode(bookViewMode === "accordion" ? "table" : "accordion")}
            >
              {bookViewMode === "accordion" ? "Switch to Flat Table" : "Switch to Grouped Dropdown"}
            </Button>
          </div>
        </div>

        {bookViewMode === "accordion" ? (
          <div className="space-y-3">
            {Object.entries(booksByCategory).map(([cat, catBooks]) => {
              const isOpen = expandedCategories[cat] ?? true;
              return (
                <div key={cat} className="rounded-lg border bg-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategoryAccordion(cat)}
                    className="flex w-full items-center justify-between p-4 text-left font-medium transition hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-serif text-base">{cat}</span>
                      <Badge variant="secondary" className="text-xs">
                        {catBooks.length} books
                      </Badge>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Listing</TableHead>
                            <TableHead>Seller</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {catBooks.map((book) => (
                            <TableRow key={book.id}>
                              <TableCell className="font-medium">
                                {book.title}
                                <p className="text-xs font-normal text-muted-foreground">{egp(book.price)} · {book.author}</p>
                              </TableCell>
                              <TableCell>{getSellerName(book.sellerId, book.sellerName)}</TableCell>
                              <TableCell className="text-xs">{book.condition}</TableCell>
                              <TableCell>
                                {book.removed ? (
                                  <Badge className="bg-destructive/15 text-destructive">Removed</Badge>
                                ) : book.flagged ? (
                                  <Badge className="bg-amber-gold/25 text-foreground">Flagged</Badge>
                                ) : (
                                  <Badge className="bg-sage/25 text-primary">Live</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label={book.flagged ? "Clear flag" : "Flag listing"}
                                  onClick={() => {
                                    toggleFlag(book.id);
                                    toast.success(book.flagged ? "Flag cleared" : "Listing flagged");
                                  }}
                                >
                                  <Flag className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    toggleRemoved(book.id);
                                    toast.success(book.removed ? "Listing restored" : "Listing removed");
                                  }}
                                >
                                  {book.removed ? "Restore" : "Remove"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              );
            })}
            {Object.keys(booksByCategory).length === 0 && (
              <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
                No books found matching the current filter.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">
                      {book.title}
                      <p className="text-xs font-normal text-muted-foreground">{egp(book.price)} · {book.author}</p>
                    </TableCell>
                    <TableCell>{getSellerName(book.sellerId, book.sellerName)}</TableCell>
                    <TableCell>{book.category}</TableCell>
                    <TableCell>
                      {book.removed ? (
                        <Badge className="bg-destructive/15 text-destructive">Removed</Badge>
                      ) : book.flagged ? (
                        <Badge className="bg-amber-gold/25 text-foreground">Flagged</Badge>
                      ) : (
                        <Badge className="bg-sage/25 text-primary">Live</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={book.flagged ? "Clear flag" : "Flag listing"}
                        onClick={() => {
                          toggleFlag(book.id);
                          toast.success(book.flagged ? "Flag cleared" : "Listing flagged");
                        }}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toggleRemoved(book.id);
                          toast.success(book.removed ? "Listing restored" : "Listing removed");
                        }}
                      >
                        {book.removed ? "Restore" : "Remove"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* 5. CUSTOMER SUPPORT TICKETS (Requirement 5) */}
      <section className="mt-10">
        <SectionHeading title="Customer Support Tickets" count={supportTickets.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supportTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-semibold">#{ticket.id}</TableCell>
                  <TableCell>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{ticket.message}</p>
                  </TableCell>
                  <TableCell>{ticket.customerEmail || "Reader"}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.adminResponse ? "secondary" : "outline"} className={ticket.adminResponse ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}>
                      {ticket.adminResponse ? "Resolved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyTicket(ticket);
                        setAdminResponseText(ticket.adminResponse || "");
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" /> {ticket.adminResponse ? "View / Edit" : "Reply"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!supportTickets.length && <EmptyRow colSpan={6} text="No customer support tickets submitted yet." />}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 6. USER CONTROL & SUSPENSION */}
      <section className="mt-10">
        <SectionHeading title="User Control" count={displayUsers.length} />
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user) => {
                const isSuspended = user.isSuspended || user.status === "suspended";
                const userRole = user.role || "customer";
                const roleDisplay = userRole === "seller" ? "Seller" : userRole === "admin" ? "Admin" : "Customer";
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.name || user.userName || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userRole === "seller" ? "default" : "outline"} className={userRole === "seller" ? "bg-primary text-primary-foreground" : ""}>
                        {roleDisplay}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joined || "Recent"}</TableCell>
                    <TableCell>
                      <Badge className={!isSuspended ? "bg-sage/25 text-primary" : "bg-destructive/15 text-destructive"}>
                        {!isSuspended ? "active" : "suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const next = isSuspended ? "active" : "suspended";
                          try {
                            await apiFetch(`/api/Admin/users/${user.id}/toggle-status`, { method: "PUT" });
                            setUserStatus(user.id, next);
                            toast.success(`${user.name || user.email} status updated`);
                            loadData();
                          } catch {
                            setUserStatus(user.id, next);
                            toast.success(`${user.name || user.email} marked ${next}`);
                          }
                        }}
                      >
                        {!isSuspended ? "Suspend" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 7. CATEGORIES & ORDERS */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        <section>
          <SectionHeading title="Categories" count={categories.length} />
          <div className="rounded-lg border bg-card p-4">
            <div className="flex gap-2">
              <Label htmlFor="new-category" className="sr-only">New category</Label>
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                onKeyDown={(e) => e.key === "Enter" && addNewCategory()}
              />
              <Button size="icon" aria-label="Add category" onClick={addNewCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center gap-2 border-b pb-2 last:border-0 last:pb-0">
                  {editingCategory === category ? (
                    <Input value={categoryDraft} onChange={(e) => setCategoryDraft(e.target.value)} autoFocus />
                  ) : (
                    <span className="flex-1 text-sm">{category}</span>
                  )}
                  {editingCategory === category ? (
                    <Button size="icon" variant="ghost" aria-label="Save category" onClick={() => saveCategory(category)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Rename ${category}`}
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryDraft(category);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${category}`}
                    className="text-destructive"
                    onClick={() => {
                      removeCategory(category);
                      toast.success("Category removed");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading title="Master Order Overview" count={orders.length} />
          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id}
                      <p className="text-xs font-normal text-muted-foreground">{order.placedAt}</p>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{egp(order.total)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(val) => handleAdminOrderStatusChange(order.id, val as OrderStatus)}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue>
                            <Badge className={statusTone[order.status]}>{order.status}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" aria-label={`View ${order.id}`} onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!orders.length && <EmptyRow colSpan={5} text="No orders have been placed." />}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      {/* TICKET RESPONSE MODAL */}
      <Dialog open={!!replyTicket} onOpenChange={(open) => !open && setReplyTicket(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Support Ticket #{replyTicket?.id}</DialogTitle>
          </DialogHeader>
          {replyTicket && (
            <div className="space-y-4 py-2">
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Subject: {replyTicket.subject}</p>
                <p className="mt-1 text-sm">{replyTicket.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">From: {replyTicket.customerEmail || "Reader"}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-reply">Steward Response</Label>
                <Textarea
                  id="admin-reply"
                  rows={4}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="Type your response to the customer..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyTicket(null)}>Cancel</Button>
            <Button onClick={handleReplyTicket} disabled={!adminResponseText.trim()}>Send Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleAdminOrderStatusChange}
      />
    </div>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="font-display text-xl tracking-wide">{title}</h2>
      <Badge variant="outline">{count}</Badge>
    </div>
  );
}

function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center text-sm text-muted-foreground">
        {text}
      </TableCell>
    </TableRow>
  );
}

function OrderDialog({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (id: string, s: OrderStatus) => void;
}) {
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">Order {order?.id}</DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{order.customerName}</span>
              <Select
                value={order.status}
                onValueChange={(val) => onStatusChange(order.id, val as OrderStatus)}
              >
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue>
                    <Badge className={statusTone[order.status]}>{order.status}</Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground">Ships to {order.address}</p>
            <div className="space-y-2 border-y py-4">
              {order.lines.map((line) => (
                <div key={line.bookId} className="flex justify-between gap-3">
                  <span>{line.title} × {line.quantity}</span>
                  <span>{egp(line.price * line.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{egp(order.total)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
