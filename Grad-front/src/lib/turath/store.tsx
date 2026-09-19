import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_ID,
  CUSTOMER_ID,
  PENDING_SELLER_ID,
  SELLER_ID,
  initialBooks,
  initialCategories,
  initialOrders,
  initialUsers,
} from "./data";
import { apiFetch, currentUserId } from "./api";
import type { AppUser, Book, CartItem, Order, OrderStatus, Role, Review } from "./types";

// Bump version to invalidate any stale localStorage data containing "Unknown seller"
const STORAGE_KEY = "turath-state-v2";

interface Persisted {
  role: Role;
  authUserId: string | null;
  books: Book[];
  users: AppUser[];
  orders: Order[];
  categories: string[];
  cart: CartItem[];
  wishlist: string[];
}

const defaults: Persisted = {
  role: "customer",
  authUserId: null,
  books: [],
  users: initialUsers,
  orders: initialOrders,
  categories: [],
  cart: [],
  wishlist: [],
};

interface StoreValue extends Persisted {
  hydrated: boolean;
  activeUser: AppUser | null;
  isAuthenticated: boolean;
  setRole: (r: Role) => void;
  signOut: () => void;
  registerUser: (user: Omit<AppUser, "id" | "joined" | "status">) => AppUser;
  signIn: (email: string) => boolean;
  updateProfile: (userId: string, profile: Partial<AppUser>) => void;
  resetAll: () => void;
  visibleBooks: Book[];
  bookById: (id: string) => Book | undefined;
  sellerName: (id: string, directName?: string) => string;
  addToCart: (bookId: string, qty?: number) => void;
  setCartQty: (bookId: string, qty: number) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  toggleWishlist: (bookId: string) => void;
  placeOrder: (address: string) => Promise<string | null>;
  cancelOrder: (orderId: string) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  addReview: (bookId: string, review: Omit<Review, "id" | "date">) => void;
  saveBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  toggleFlag: (bookId: string) => void;
  toggleRemoved: (bookId: string) => void;
  setUserStatus: (userId: string, status: AppUser["status"]) => void;
  decideSeller: (userId: string, decision: "approved" | "rejected") => void;
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategory: (name: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export const SHIPPING = 35;
export const TAX_RATE = 0.14;

export const roleLabels: Record<Role, { en: string; ar: string }> = {
  customer: { en: "Customer", ar: "قارئ" },
  seller: { en: "Approved Seller", ar: "بائع معتمد" },
  pendingSeller: { en: "Pending Seller", ar: "بائع قيد المراجعة" },
  admin: { en: "Administrator", ar: "مشرف" },
};

// Known fallback map for seeded backend sellers
const SELLER_FALLBACK_MAP: Record<string, string> = {
  "e89be4a0-a929-48f1-aab9-a611b58f6be1": "Turath Foundation",
  "e89be4a0-a929-48f1-aab9-a611b58f6be2": "Dar Al-Maaref Publishing",
  "e89be4a0-a929-48f1-aab9-a611b58f6be3": "Alexandria Library Trust",
  "e89be4a0-a929-48f1-aab9-a611b58f6be4": "Youssef Mansour",
  "e89be4a0-a929-48f1-aab9-a611b58f6be5": "Mona El-Khatib",
  "e89be4a0-a929-48f1-aab9-a611b58f6be6": "Tarek Hegazy",
};

// --- NEW: decode the real role out of the JWT instead of fabricating it locally ---
function decodeTokenRole(): Exclude<Role, "pendingSeller"> | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const rawRole =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      payload.role;
    if (!rawRole) return null;
    const normalized = String(rawRole).toLowerCase();
    if (normalized === "admin") return "admin";
    if (normalized === "seller") return "seller";
    return "customer";
  } catch {
    return null;
  }
}

export function TurathProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaults, ...(JSON.parse(raw) as Persisted) });
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const patch = useCallback((p: Partial<Persisted>) => setState((s) => ({ ...s, ...p })), []);

  useEffect(() => {
    if (!hydrated) return;

    let active = true;
    const fallbackBooks = state.books.length > 0 ? state.books : initialBooks;
    const fallbackCategories = state.categories.length > 0 ? state.categories : initialCategories;

    Promise.all([
      apiFetch<any[]>("/api/Books")
        .then((data) =>
          Array.isArray(data)
            ? data.map((item: any) => ({
                id: String(item.id),
                title: item.title ?? "Untitled",
                titleAr: item.titleAr ?? undefined,
                author: item.author ?? "Unknown",
                price: Number(item.price ?? 0),
                availableQuantity: Number(item.quantity ?? item.availableQuantity ?? 0),
                category: item.categoryName ?? item.category ?? "General",
                condition: (item.condition ?? "Good") as Book["condition"],
                description: item.description ?? "",
                conditionNotes: item.conditionNotes ?? "",
                sellerId: item.sellerId ?? "",
                sellerName: item.sellerName || SELLER_FALLBACK_MAP[item.sellerId] || "Verified Seller",
                spine: (item.spine ?? ["rust", "navy", "amber", "sage", "crimson"][Math.abs(Number(item.id)) % 5]) as Book["spine"],
                images: [item.imageUrl ?? ""].filter(
                  (url): url is string => Boolean(url) && url !== "__REAL_COVER_URL_REQUIRED__",
                ),
                imageUrl: item.imageUrl ?? "",
                reviews: Array.isArray(item.reviews) ? item.reviews : [],
                flagged: false,
                removed: false,
                ageRating: item.ageRating ?? "All Ages",
                approvalStatus: item.approvalStatus ?? "Approved",
              }))
            : [],
        )
        .catch(() => []),
      apiFetch<any[]>("/api/Categories")
        .then((data) =>
          Array.isArray(data)
            ? data.map((item: any) => item.name ?? item.title ?? item.category ?? "General")
            : [],
        )
        .catch(() => []),
    ])
      .then(([books, categories]) => {
        if (!active) return;

        patch({
          books: books.length > 0 ? books : fallbackBooks,
          categories: categories.length > 0 ? categories : fallbackCategories,
        });
      })
      .catch(() => {
        if (!active) return;
        patch({
          books: fallbackBooks,
          categories: fallbackCategories,
        });
      });

    return () => {
      active = false;
    };
  }, [hydrated, patch]);

  const syncOrdersFromServer = useCallback(async () => {
    const userId = currentUserId() || state.authUserId;
    if (!userId) return;

    try {
      const data = await apiFetch<any[]>(`/api/Orders/${userId}`);
      if (Array.isArray(data)) {
        const mappedOrders: Order[] = data.map((o: any) => ({
          id: String(o.id ?? o.orderId),
          customerId: o.customerId ?? userId,
          customerName: o.customerName ?? "Customer",
          lines: (o.orderItems ?? o.items ?? o.lines ?? []).map((item: any) => ({
            bookId: String(item.productId ?? item.bookId),
            title: item.title ?? item.bookTitle ?? "Book",
            author: item.author ?? "",
            price: Number(item.unitPrice ?? item.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            sellerId: item.sellerId ?? "",
          })),
          subtotal: Number(o.subtotal ?? o.totalPrice ?? o.total ?? 0),
          shipping: Number(o.shipping ?? SHIPPING),
          tax: Number(o.tax ?? 0),
          total: Number(o.totalPrice ?? o.total ?? 0),
          status: (o.status ?? "Pending") as OrderStatus,
          placedAt: o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          address: o.shippingAddress ?? o.address ?? "Cairo, Egypt",
        }));

        patch({ orders: mappedOrders });
      }
    } catch {
      // Retain existing local orders if network fetch fails
    }
  }, [state.authUserId, patch]);

  const syncWishlist = useCallback(async () => {
    const userId = currentUserId() || state.authUserId;
    if (!userId) return;

    try {
      const data = await apiFetch<any[]>("/api/Wishlist");
      if (Array.isArray(data)) {
        patch({ wishlist: data.map((item: any) => String(item.bookId ?? item.productId ?? item)) });
        return;
      }
    } catch {
      const saved = localStorage.getItem(`turath-wishlist-${userId}`);
      if (saved) {
        try {
          patch({ wishlist: JSON.parse(saved) });
        } catch {}
      }
    }
  }, [state.authUserId, patch]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.authUserId) {
      void syncOrdersFromServer();
      void syncWishlist();
    }
  }, [hydrated, state.authUserId, syncOrdersFromServer, syncWishlist]);

  useEffect(() => {
    if (!hydrated || !state.authUserId) return;
    localStorage.setItem(`turath-wishlist-${state.authUserId}`, JSON.stringify(state.wishlist));
  }, [hydrated, state.authUserId, state.wishlist]);

  const syncCartFromServer = useCallback(async () => {
    const userId = currentUserId();
    if (!userId) return;

    try {
      const payload = await apiFetch<{ customerId?: string; cartItems?: Array<{ productId?: number; quantity?: number; id?: string }>; items?: Array<{ productId?: number; quantity?: number; id?: string }> }>(`/api/Cart/${userId}`);
      const items = (payload.cartItems ?? payload.items ?? []) as Array<{ productId?: number; quantity?: number; id?: string }>;
      const nextCart = items
        .map((item) => ({
          bookId: String(item.productId ?? item.id ?? ""),
          quantity: Number(item.quantity ?? 0),
        }))
        .filter((item) => item.bookId && item.quantity > 0);

      patch({ cart: nextCart });
    } catch {
      // fall back to local cart state when server is unreachable
    }
  }, [patch]);

  useEffect(() => {
    if (!hydrated) return;
    void syncCartFromServer();
  }, [hydrated, state.authUserId, syncCartFromServer]);

  const value = useMemo<StoreValue>(() => {
    const { books, users, orders, categories, cart, wishlist, role, authUserId } = state;

    // FIX: no longer falls back to a fake demo user when signed out.
    // activeUser is null unless someone is actually authenticated.
    const activeUser: AppUser | null = authUserId
      ? users.find((u) => u.id === authUserId) ?? users.find((u) => u.email === localStorage.getItem("turath-email")) ?? null
      : null;

    const bookById = (id: string) => books.find((b) => b.id === id);

    const updateBooks = (fn: (b: Book) => Book) => patch({ books: books.map(fn) });

    return {
      ...state,
      hydrated,
      activeUser,
      isAuthenticated: Boolean(authUserId),

      setRole: (r) => patch({ role: r, authUserId: null, cart: [] }),

      // FIX: wishlist now clears on sign out too, not just cart.
      signOut: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("turath-email");
        patch({ authUserId: null, role: "customer", cart: [], wishlist: [] });
      },

      // FIX: role is no longer fabricated at signup. A "seller" signup still
      // registers as a normal customer locally — actual seller status only ever
      // comes from the real JWT role claim (see decodeTokenRole), set after
      // signIn/register call the real backend and get a real token back.
      registerUser: (user) => {
        const created: AppUser = {
          ...user,
          id: `u-${Date.now()}`,
          joined: new Date().toISOString().slice(0, 10),
          status: "active",
        };
        const realRole = decodeTokenRole() ?? "customer";
        const authenticatedId = currentUserId() ?? created.id;
        const authenticatedUser = { ...created, id: authenticatedId, role: realRole };
        localStorage.setItem("turath-email", user.email);
        patch({
          users: [authenticatedUser, ...users.filter((existing) => existing.email.toLowerCase() !== user.email.toLowerCase())],
          authUserId: authenticatedId,
          role: realRole,
        });
        return authenticatedUser;
      },

      // FIX: role now comes from the real token, not from local user.sellerState guesswork.
      signIn: (email) => {
        const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user || user.status === "suspended") return false;
        const realRole = decodeTokenRole() ?? "customer";
        const authenticatedId = currentUserId() ?? user.id;
        localStorage.setItem("turath-email", user.email);
        patch({
          users: users.map((existing) => existing.id === user.id ? { ...existing, id: authenticatedId, role: realRole } : existing),
          authUserId: authenticatedId,
          role: realRole,
        });
        return true;
      },

      updateProfile: (userId, profile) =>
        patch({ users: users.map((u) => (u.id === userId ? { ...u, ...profile } : u)) }),
      resetAll: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("token");
        setState(defaults);
      },
      visibleBooks: books.filter((b) => !b.removed),
      bookById,

      sellerName: (id: string, directName?: string) =>
        directName ||
        SELLER_FALLBACK_MAP[id] ||
        users.find((u) => u.id === id)?.name ||
        "Verified Seller",

      addToCart: (bookId, qty = 1) => {
        const book = bookById(bookId);
        if (!book) return;
        const existing = cart.find((c) => c.bookId === bookId);
        const next = Math.min((existing?.quantity ?? 0) + qty, book.availableQuantity);
        if (next <= 0) return;
        patch({
          cart: existing
            ? cart.map((c) => (c.bookId === bookId ? { ...c, quantity: next } : c))
            : [...cart, { bookId, quantity: next }],
        });

        const userId = currentUserId();
        if (userId) {
          void apiFetch(`/api/Cart/add`, {
            method: "POST",
            body: JSON.stringify({ customerId: userId, productId: Number(bookId), quantity: qty }),
          }).catch(() => undefined);
        }
      },
      setCartQty: (bookId, qty) => {
        const book = bookById(bookId);
        if (!book) return;
        const clamped = Math.max(1, Math.min(qty, book.availableQuantity));
        patch({ cart: cart.map((c) => (c.bookId === bookId ? { ...c, quantity: clamped } : c)) });

        const userId = currentUserId();
        if (userId) {
          void apiFetch(`/api/Cart/update-item`, {
            method: "PUT",
            body: JSON.stringify({ customerId: userId, productId: Number(bookId), quantity: clamped }),
          }).catch(() => undefined);
        }
      },
      removeFromCart: (bookId) => {
        patch({ cart: cart.filter((c) => c.bookId !== bookId) });

        const userId = currentUserId();
        if (userId) {
          void apiFetch(`/api/Cart/remove-item`, {
            method: "DELETE",
            body: JSON.stringify({ customerId: userId, productId: Number(bookId) }),
          }).catch(() => undefined);
        }
      },
      clearCart: () => patch({ cart: [] }),
      toggleWishlist: (bookId) => {
        const saved = wishlist.includes(bookId);
        patch({ wishlist: saved ? wishlist.filter((w) => w !== bookId) : [...wishlist, bookId] });
        if (currentUserId()) {
          void apiFetch(
            saved ? `/api/Wishlist/remove/${bookId}` : "/api/Wishlist/add",
            saved
              ? { method: "DELETE" }
              : { method: "POST", body: JSON.stringify({ bookId: Number(bookId) }) },
          ).catch(() => undefined);
        }
      },

      // FIX: now actually awaits and uses the REAL backend response —
      // real order id, real total — instead of always fabricating one locally.
      // Falls back to a local mock order ONLY if the real call fails, so
      // demoing offline still works, but a working backend is always preferred.
      placeOrder: async (address) => {
        const lines = cart
          .map((c) => {
            const b = bookById(c.bookId);
            if (!b) return null;
            return {
              bookId: b.id,
              title: b.title,
              author: b.author,
              price: b.price,
              quantity: Math.min(c.quantity, b.availableQuantity),
              sellerId: b.sellerId,
            };
          })
          .filter(Boolean) as Order["lines"];
        if (!lines.length) return null;

        const userId = currentUserId();

        if (userId) {
          try {
            const result = await apiFetch<{ id?: string; orderId?: string; total?: number; totalPrice?: number }>(
              `/api/Cart/checkout`,
              {
                method: "POST",
                body: JSON.stringify({ customerId: userId }),
              },
            );

            const realId = String(result?.id ?? result?.orderId ?? "");
            const realTotal = Number(result?.total ?? result?.totalPrice ?? 0);

            if (realId) {
              const order: Order = {
                id: realId,
                customerId: userId,
                customerName: activeUser?.name ?? "Customer",
                lines,
                subtotal: realTotal,
                shipping: 0,
                tax: 0,
                total: realTotal,
                status: "Pending",
                placedAt: new Date().toISOString().slice(0, 10),
                address,
              };
              patch({ orders: [order, ...orders], cart: [] });
              void syncOrdersFromServer(); // refresh with full server-side details
              return realId;
            }
          } catch {
            // fall through to local mock order below if the real call fails
          }
        }

        // Local fallback (offline / no backend reachable) — clearly a mock order.
        const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const id = `MOCK-${1100 + orders.length}`;
        const order: Order = {
          id,
          customerId: activeUser?.id ?? "guest",
          customerName: activeUser?.name ?? "Customer",
          lines,
          subtotal,
          shipping: SHIPPING,
          tax,
          total: Math.round((subtotal + SHIPPING + tax) * 100) / 100,
          status: "Pending",
          placedAt: new Date().toISOString().slice(0, 10),
          address,
        };
        patch({
          orders: [order, ...orders],
          cart: [],
          books: books.map((b) => {
            const line = lines.find((l) => l.bookId === b.id);
            return line
              ? { ...b, availableQuantity: Math.max(0, b.availableQuantity - line.quantity) }
              : b;
          }),
        });
        return id;
      },

      cancelOrder: (orderId) => {
        const userId = currentUserId();
        if (userId) {
          void apiFetch(`/api/Orders/${orderId}/cancel`, {
            method: "PATCH",
          }).catch(() => undefined);
        }
        patch({
          orders: orders.map((o) =>
            o.id === orderId && o.status === "Pending" ? { ...o, status: "Cancelled" } : o,
          ),
        });
      },
      setOrderStatus: (orderId, status) =>
        patch({ orders: orders.map((o) => (o.id === orderId ? { ...o, status } : o)) }),

      addReview: (bookId, review) =>
        updateBooks((b) =>
          b.id === bookId
            ? {
                ...b,
                reviews: [
                  {
                    ...review,
                    id: `r-${Date.now()}`,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...b.reviews,
                ],
              }
            : b,
        ),

      saveBook: (book) =>
        patch({
          books: books.some((b) => b.id === book.id)
            ? books.map((b) => (b.id === book.id ? book : b))
            : [book, ...books],
        }),
      deleteBook: (bookId) =>
        patch({
          books: books.filter((b) => b.id !== bookId),
          cart: cart.filter((c) => c.bookId !== bookId),
        }),
      toggleFlag: (bookId) => updateBooks((b) => (b.id === bookId ? { ...b, flagged: !b.flagged } : b)),
      toggleRemoved: (bookId) =>
        updateBooks((b) => (b.id === bookId ? { ...b, removed: !b.removed } : b)),

      setUserStatus: (userId, status) =>
        patch({ users: users.map((u) => (u.id === userId ? { ...u, status } : u)) }),
      decideSeller: (userId, decision) =>
        patch({ users: users.map((u) => (u.id === userId ? { ...u, sellerState: decision } : u)) }),

      addCategory: (name) => {
        const clean = name.trim();
        if (!clean || categories.includes(clean)) return;
        patch({ categories: [...categories, clean] });
      },
      renameCategory: (oldName, newName) => {
        const clean = newName.trim();
        if (!clean) return;
        patch({
          categories: categories.map((c) => (c === oldName ? clean : c)),
          books: books.map((b) => (b.category === oldName ? { ...b, category: clean } : b)),
        });
      },
      removeCategory: (name) => patch({ categories: categories.filter((c) => c !== name) }),
    };
  }, [state, hydrated, patch]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTurath() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useTurath must be used inside TurathProvider");
  return ctx;
}

export function avgRating(book: Book) {
  if (!book.reviews.length) return 0;
  return book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length;
}

export const egp = (n: number) =>
  `${n.toLocaleString("en-EG", { maximumFractionDigits: 2 })} EGP`;
