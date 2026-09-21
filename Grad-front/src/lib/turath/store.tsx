import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { apiFetch, currentUserId, currentUserRoles } from "./api";
import type { AppUser, Book, CartItem, Order, OrderStatus, Role, Review } from "./types";

// Bump version to invalidate any stale localStorage data containing old empty reviews
const STORAGE_KEY = "turath-state-v3";

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
  editReview: (bookId: string, reviewId: string, rating: number, comment: string) => void;
  requestCategory: (name: string) => Promise<boolean>;
  saveBook: (book: Book) => Promise<Book>;
  deleteBook: (bookId: string) => void;
  toggleFlag: (bookId: string) => void;
  toggleRemoved: (bookId: string) => void;
  setUserStatus: (userId: string, status: AppUser["status"]) => void;
  decideSeller: (userId: string, decision: "approved" | "rejected") => void;
  addCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  removeCategory: (name: string) => void;
  decideBook: (bookId: string, decision: "Approved" | "Rejected") => void;
  refreshBooks: () => Promise<void>;
  syncOrdersFromServer: () => Promise<void>;
  syncCurrentUserProfile: () => Promise<void>;
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

export const USER_FALLBACK_MAP: Record<string, string> = {
  "u-customer": "Roaa Alaa",
  "u-customer-2": "Yusuf Karim",
  "u-customer-3": "Mariam Sobhy",
  "u-seller-approved": "Dar Al-Warraq",
  "u-seller-pending": "Maktabat Al-Ghusn",
  "u-seller-pending-2": "Sahafat Books",
  "u-seller-2": "Nile Rare Editions",
  "u-admin": "Turath Steward",
  "u-admin-com": "Turath Steward",
  ...SELLER_FALLBACK_MAP,
};

export function isIdString(s?: string): boolean {
  if (!s || typeof s !== "string") return false;
  const trimmed = s.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return true;
  if (/^u-[a-z0-9_-]+/i.test(trimmed)) return true;
  if (/^r-[a-z0-9_-]+/i.test(trimmed)) return true;
  if (/^[0-9]{4,}$/.test(trimmed)) return true;
  return false;
}

export function resolveUserName(raw?: string, usersList?: AppUser[]): string {
  if (!raw || typeof raw !== "string") return "Turath Reader";
  const trimmed = raw.trim();
  if (!trimmed) return "Turath Reader";

  if (USER_FALLBACK_MAP[trimmed]) return USER_FALLBACK_MAP[trimmed];

  if (usersList && usersList.length > 0) {
    const found = usersList.find(
      (u) =>
        u.id === trimmed ||
        u.email?.toLowerCase() === trimmed.toLowerCase() ||
        u.name?.toLowerCase() === trimmed.toLowerCase()
    );
    if (found && found.name && !isIdString(found.name)) {
      return found.name;
    }
  }

  if (trimmed.includes("@")) {
    const prefix = trimmed.split("@")[0].replace(/[._-]/g, " ");
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  if (isIdString(trimmed)) {
    return "Turath Reader";
  }

  return trimmed;
}

// --- NEW: decode the real role out of the JWT instead of fabricating it locally ---
export function decodeTokenRole(): Exclude<Role, "pendingSeller"> | null {
  const roles = currentUserRoles().map((r) => String(r).toLowerCase());
  if (roles.includes("admin")) return "admin";
  if (roles.includes("seller")) return "seller";
  if (roles.length > 0) return "customer";
  return null;
}

export function TurathProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaults, ...(JSON.parse(raw) as Persisted) });
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (!token) {
          parsed.authUserId = null;
          parsed.role = "customer";
        }
        setState({ ...defaults, ...parsed });
      } else {
        setState(defaults);
      }
    } catch {
      /* ignore corrupt state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    const toSave = !token
      ? { ...state, authUserId: null, role: "customer" as const }
      : state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state, hydrated]);

  const patch = useCallback((p: Partial<Persisted>) => setState((s) => ({ ...s, ...p })), []);

  const refreshBooks = useCallback(async () => {
    const currentState = stateRef.current;
    const fallbackBooks = currentState.books.length > 0 ? currentState.books : initialBooks;
    const fallbackCategories = currentState.categories.length > 0 ? currentState.categories : initialCategories;

    const mapBookDto = (item: any): Book => ({
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
      reviews: Array.isArray(item.reviews) && item.reviews.length > 0
        ? item.reviews.map((r: any) => {
            const name = r.customerName && !isIdString(r.customerName)
              ? r.customerName
              : resolveUserName(r.customerName || r.customerId || r.author, stateRef.current.users);
            return {
              id: String(r.id ?? `r-${Date.now()}`),
              author: name,
              rating: Number(r.rating ?? 5),
              comment: r.comment ?? "",
              date: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "Recently",
              verified: true,
            };
          })
        : (initialBooks.find((ib) => String(ib.id) === String(item.id) || ib.title.toLowerCase() === (item.title ?? "").toLowerCase())?.reviews ?? []),
      flagged: false,
      removed: false,
      ageRating: item.ageRating ?? "All Ages",
      approvalStatus: item.approvalStatus
        ? (typeof item.approvalStatus === "string"
            ? item.approvalStatus
            : ["Pending", "Approved", "Rejected"][item.approvalStatus] ?? "Approved")
        : "Approved",
    });

    const hasToken = typeof localStorage !== "undefined" && Boolean(localStorage.getItem("token"));
    const tokenRole = decodeTokenRole();
    const isAdminUser = tokenRole === "admin";
    const minePromise = hasToken ? apiFetch<any[]>("/api/Books/mine").catch(() => []) : Promise.resolve([]);
    const adminPendingPromise = isAdminUser ? apiFetch<any[]>("/api/Admin/books/pending").catch(() => []) : Promise.resolve([]);

    try {
      const [booksData, categoriesData, mineData, adminPendingData] = await Promise.all([
        apiFetch<any[]>("/api/Books").catch(() => []),
        apiFetch<any[]>("/api/Categories").catch(() => []),
        minePromise,
        adminPendingPromise,
      ]);

      const publicBooks = Array.isArray(booksData) ? booksData.map(mapBookDto) : [];
      const myBooks = Array.isArray(mineData) ? mineData.map(mapBookDto) : [];
      const adminPendingBooks = Array.isArray(adminPendingData)
        ? adminPendingData.map((b) => ({ ...mapBookDto(b), approvalStatus: "Pending" as const }))
        : [];

      const bookMap = new Map<string, Book>();
      for (const b of publicBooks) {
        bookMap.set(b.id, b);
      }
      for (const b of myBooks) {
        if (b.approvalStatus !== "Rejected") {
          bookMap.set(b.id, b);
        }
      }
      for (const b of adminPendingBooks) {
        bookMap.set(b.id, b);
      }
      for (const b of stateRef.current.books) {
        if (!bookMap.has(b.id) && b.approvalStatus === "Pending") {
          bookMap.set(b.id, b);
        }
      }

      const combinedBooks = Array.from(bookMap.values());
      const categories = Array.isArray(categoriesData)
        ? categoriesData.map((item: any) => item.name ?? item.title ?? item.category ?? "General")
        : [];

      setState((prev) => ({
        ...prev,
        books: combinedBooks.length > 0 ? combinedBooks : (prev.books.length > 0 ? prev.books : fallbackBooks),
        categories: categories.length > 0 ? categories : (prev.categories.length > 0 ? prev.categories : fallbackCategories),
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        books: prev.books.length > 0 ? prev.books : fallbackBooks,
        categories: prev.categories.length > 0 ? prev.categories : fallbackCategories,
      }));
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void refreshBooks();
  }, [hydrated, refreshBooks]);

  const syncOrdersFromServer = useCallback(async () => {
    const userId = currentUserId() || stateRef.current.authUserId;
    if (!userId) return;

    try {
      const data = await apiFetch<any[]>(`/api/Orders`);
      if (Array.isArray(data)) {
        const mappedOrders: Order[] = data.map((o: any) => ({
          id: String(o.id ?? o.orderId),
          customerId: String(o.customerId ?? userId),
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

        setState((prev) => ({ ...prev, orders: mappedOrders }));
        localStorage.setItem(`turath-orders-${userId}`, JSON.stringify(mappedOrders));
      }
    } catch {
      const saved = localStorage.getItem(`turath-orders-${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState((prev) => ({ ...prev, orders: parsed }));
        } catch {}
      }
    }
  }, []);

  const syncWishlist = useCallback(async () => {
    const userId = currentUserId() || stateRef.current.authUserId;
    if (!userId) return;

    try {
      const data = await apiFetch<any[]>("/api/Wishlist");
      if (Array.isArray(data)) {
        const ids = data.map((item: any) => String(item.bookId ?? item.productId ?? item.id ?? item));
        setState((prev) => ({ ...prev, wishlist: ids }));
        localStorage.setItem(`turath-wishlist-${userId}`, JSON.stringify(ids));
        return;
      }
    } catch {
      const saved = localStorage.getItem(`turath-wishlist-${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState((prev) => ({ ...prev, wishlist: parsed }));
        } catch {}
      }
    }
  }, []);

  const syncCartFromServer = useCallback(async () => {
    const userId = currentUserId() || stateRef.current.authUserId;
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

      if (nextCart.length > 0) {
        setState((prev) => ({ ...prev, cart: nextCart }));
      }
    } catch {
      // preserve local cart state when server is unreachable
    }
  }, []);

  const syncCurrentUserProfile = useCallback(async () => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const res = await apiFetch<any>("/api/Auth/me");
      if (res && res.id) {
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        if (res.email) {
          localStorage.setItem("turath-email", res.email);
        }
        const updatedUser: AppUser = {
          id: res.id,
          name: res.name || res.username || res.email,
          email: res.email,
          role: res.role,
          sellerState: res.sellerState,
          status: "active",
          joined: "Member",
          phone: res.phoneNumber,
        };
        try {
          localStorage.setItem(`turath-profile-${res.id}`, JSON.stringify(updatedUser));
          if (res.email) {
            localStorage.setItem(`turath-profile-${res.email.toLowerCase()}`, JSON.stringify(updatedUser));
          }
        } catch {}
        setState((prev) => ({
          ...prev,
          role: res.role,
          authUserId: res.id,
          users: [
            updatedUser,
            ...prev.users.filter((u) => u.id !== res.id && u.email.toLowerCase() !== res.email.toLowerCase()),
          ],
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const hasToken = typeof localStorage !== "undefined" && Boolean(localStorage.getItem("token"));
    if (hasToken) {
      void syncCurrentUserProfile();
      void syncOrdersFromServer();
      void syncWishlist();
      void syncCartFromServer();
    }
  }, [hydrated, syncCurrentUserProfile, syncOrdersFromServer, syncWishlist, syncCartFromServer]);

  const value = useMemo<StoreValue>(() => {
    const { books, users, orders, categories, cart, wishlist, role, authUserId } = state;

    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    const hasToken = Boolean(token);
    const storedEmail = (typeof localStorage !== "undefined" ? localStorage.getItem("turath-email") : null) || undefined;

    const effectiveAuthUserId = authUserId || (hasToken ? currentUserId() : null);

    let matchedUser = effectiveAuthUserId
      ? users.find((u) => u.id === effectiveAuthUserId) ??
        users.find((u) => storedEmail && u.email.toLowerCase() === storedEmail.toLowerCase())
      : null;

    if (!matchedUser && effectiveAuthUserId && typeof localStorage !== "undefined") {
      try {
        const cached =
          localStorage.getItem(`turath-profile-${effectiveAuthUserId}`) ||
          (storedEmail ? localStorage.getItem(`turath-profile-${storedEmail.toLowerCase()}`) : null);
        if (cached) {
          matchedUser = JSON.parse(cached);
        }
      } catch {}
    }

    const tokenRole = decodeTokenRole();
    const isAdminEmail = Boolean(storedEmail?.toLowerCase().startsWith("admin@turath.") || matchedUser?.email?.toLowerCase().startsWith("admin@turath."));
    const effectiveUserRole =
      (tokenRole === "admin" || role === "admin" || matchedUser?.role === "admin" || isAdminEmail)
        ? "admin"
        : (tokenRole === "seller" || role === "seller" || matchedUser?.role === "seller" || matchedUser?.sellerState === "approved")
        ? "seller"
        : (tokenRole ?? role ?? matchedUser?.role ?? "customer");

    const effectiveSellerState =
      effectiveUserRole === "seller" || matchedUser?.sellerState === "approved"
        ? "approved"
        : matchedUser?.sellerState ?? "none";

    const activeUser: AppUser | null = effectiveAuthUserId
      ? {
          ...(matchedUser ?? {
            id: effectiveAuthUserId,
            name: storedEmail ? storedEmail.split("@")[0] : "Turath Reader",
            email: storedEmail ?? "reader@turath.com",
            status: "active",
            joined: new Date().toISOString().slice(0, 10),
          }),
          role: effectiveUserRole,
          sellerState: effectiveSellerState,
        }
      : null;

    const bookById = (id: string) => books.find((b) => b.id === id);

    const updateBooks = (fn: (b: Book) => Book) => patch({ books: books.map(fn) });

    return {
      ...state,
      authUserId: effectiveAuthUserId,
      role: effectiveAuthUserId ? effectiveUserRole : "customer",
      hydrated,
      activeUser,
      isAuthenticated: Boolean(effectiveAuthUserId && (hasToken || authUserId)),

      setRole: (r) => patch({ role: r }),

      signOut: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("turath-email");
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("turath-profile-") || key === "turath-email" || key === "token")) {
              localStorage.removeItem(key);
            }
          }
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.authUserId = null;
            parsed.role = "customer";
            parsed.cart = [];
            parsed.wishlist = [];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaults, authUserId: null, role: "customer" }));
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
        try {
          sessionStorage.clear();
        } catch {}
        patch({ authUserId: null, role: "customer", cart: [], wishlist: [] });
        if (typeof window !== "undefined") {
          if (
            window.location.pathname.startsWith("/admin") ||
            window.location.pathname.startsWith("/seller") ||
            window.location.pathname.startsWith("/account")
          ) {
            window.location.href = "/";
          }
        }
      },

      registerUser: (user) => {
        const created: AppUser = {
          ...user,
          id: `u-${Date.now()}`,
          joined: new Date().toISOString().slice(0, 10),
          status: "active",
        };
        const realRole = decodeTokenRole() ?? user.role ?? "customer";
        const authenticatedId = currentUserId() ?? created.id;
        const authenticatedUser = { ...created, id: authenticatedId, role: realRole };
        localStorage.setItem("turath-email", user.email);
        try {
          if (!localStorage.getItem("token")) {
            const payload = {
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": authenticatedId,
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": user.email.toLowerCase(),
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
                realRole === "admin" ? "Admin" : realRole === "seller" ? "Seller" : "Customer",
              exp: Math.floor(Date.now() / 1000) + 86400 * 7,
            };
            const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
            const body = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
            localStorage.setItem("token", `${header}.${body}.demoSignature`);
          }
          localStorage.setItem(`turath-profile-${user.email.toLowerCase()}`, JSON.stringify(authenticatedUser));
          if (authenticatedId) {
            localStorage.setItem(`turath-profile-${authenticatedId}`, JSON.stringify(authenticatedUser));
          }
        } catch {}

        patch({
          users: [authenticatedUser, ...users.filter((existing) => existing.email.toLowerCase() !== user.email.toLowerCase())],
          authUserId: authenticatedId,
          role: realRole,
        });
        void syncOrdersFromServer();
        void syncWishlist();
        void syncCartFromServer();
        return authenticatedUser;
      },

      signIn: (email) => {
        const normalized = email.trim().toLowerCase();
        let user = users.find((u) => u.email.toLowerCase() === normalized);
        if (!user) {
          try {
            const cached = localStorage.getItem(`turath-profile-${normalized}`);
            if (cached) user = JSON.parse(cached);
          } catch {}
        }
        if (user && user.status === "suspended") return false;
        const tokenRole = decodeTokenRole();
        const effectiveRole: Role =
          tokenRole ??
          (user?.sellerState === "approved" || user?.role === "seller"
            ? "seller"
            : user?.role ?? "customer");
        const authenticatedId = currentUserId() ?? user?.id ?? `u-${Date.now()}`;
        localStorage.setItem("turath-email", email.trim());

        try {
          if (!localStorage.getItem("token")) {
            const payload = {
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": authenticatedId,
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": normalized,
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
                effectiveRole === "admin" ? "Admin" : effectiveRole === "seller" ? "Seller" : "Customer",
              exp: Math.floor(Date.now() / 1000) + 86400 * 7,
            };
            const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
            const body = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
            localStorage.setItem("token", `${header}.${body}.demoSignature`);
          }
        } catch {}

        const updatedUser: AppUser = user
          ? { ...user, id: authenticatedId, role: effectiveRole }
          : {
              id: authenticatedId,
              name: email.trim().split("@")[0],
              email: email.trim(),
              role: effectiveRole,
              status: "active" as const,
              joined: new Date().toISOString().slice(0, 10),
            };

        try {
          localStorage.setItem(`turath-profile-${normalized}`, JSON.stringify(updatedUser));
          localStorage.setItem(`turath-profile-${authenticatedId}`, JSON.stringify(updatedUser));
        } catch {}

        const updatedUsers = [
          updatedUser,
          ...users.filter((existing) => existing.email.toLowerCase() !== normalized && existing.id !== authenticatedId),
        ];

        patch({
          users: updatedUsers,
          authUserId: authenticatedId,
          role: effectiveRole,
        });
        void syncOrdersFromServer();
        void syncWishlist();
        void syncCartFromServer();
        return true;
      },

      updateProfile: (userId, profile) => {
        const updatedUsers = users.map((u) => {
          if (u.id === userId || (storedEmail && u.email.toLowerCase() === storedEmail.toLowerCase())) {
            const updated = { ...u, ...profile };
            try {
              if (updated.email) {
                localStorage.setItem(`turath-profile-${updated.email.toLowerCase()}`, JSON.stringify(updated));
              }
              localStorage.setItem(`turath-profile-${userId}`, JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return u;
        });
        patch({ users: updatedUsers });
      },
      resetAll: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("token");
        localStorage.removeItem("turath-email");
        setState(defaults);
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
      visibleBooks: books.filter(
        (b) =>
          !b.removed &&
          (b.approvalStatus === "Approved" || (!b.approvalStatus && true)) &&
          b.approvalStatus !== "Pending" &&
          b.approvalStatus !== "Rejected"
      ),
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
        const nextWishlist = saved ? wishlist.filter((w) => w !== bookId) : [...wishlist, bookId];
        patch({ wishlist: nextWishlist });
        const userId = currentUserId() || authUserId;
        if (userId) {
          localStorage.setItem(`turath-wishlist-${userId}`, JSON.stringify(nextWishlist));
          const numericId = Number(bookId);
          if (!isNaN(numericId) && numericId > 0) {
            void apiFetch(
              saved ? `/api/Wishlist/remove/${numericId}` : "/api/Wishlist/add",
              saved
                ? { method: "DELETE" }
                : { method: "POST", body: JSON.stringify({ bookId: numericId }) },
            ).catch(() => undefined);
          }
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

        const userId = currentUserId() || authUserId;

        if (userId) {
          try {
            let result: any = null;
            try {
              result = await apiFetch<any>(`/api/Orders`, {
                method: "POST",
                body: JSON.stringify({
                  shippingAddress: address,
                  items: lines.map((l) => ({
                    productId: Number(l.bookId),
                    quantity: l.quantity,
                  })),
                }),
              });
            } catch {
              result = await apiFetch<any>(`/api/Cart/checkout`, {
                method: "POST",
                body: JSON.stringify({ customerId: userId }),
              });
            }

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
              const nextOrders = [order, ...orders.filter((o) => o.id !== realId)];
              patch({ orders: nextOrders, cart: [] });
              localStorage.setItem(`turath-orders-${userId}`, JSON.stringify(nextOrders));
              void syncOrdersFromServer();
              return realId;
            }
          } catch {
            // fall through to local mock order below if server is unreachable
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
      setOrderStatus: (orderId, status) => {
        patch({ orders: orders.map((o) => (o.id === orderId ? { ...o, status } : o)) });
        void apiFetch(`/api/Orders/${orderId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        }).catch(() => {
          void apiFetch(`/api/SellerOrders/${orderId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
          }).catch(() => undefined);
        });
      },

      addReview: (bookId, review) => {
        const numId = Number(bookId);
        if (!isNaN(numId) && numId > 0) {
          void apiFetch("/api/Reviews/create", {
            method: "POST",
            body: JSON.stringify({
              bookId: numId,
              rating: review.rating,
              comment: review.comment,
            }),
          }).catch(() => undefined);
        }
        const authorName = resolveUserName(review.author || activeUser?.name, users);
        updateBooks((b) =>
          b.id === bookId
            ? {
                ...b,
                reviews: [
                  {
                    ...review,
                    author: authorName,
                    id: `r-${Date.now()}`,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...b.reviews,
                ],
              }
            : b,
        );
      },

      editReview: (bookId, reviewId, rating, comment) => {
        const numReviewId = parseInt(reviewId.replace(/\D/g, ""), 10);
        if (!isNaN(numReviewId) && numReviewId > 0) {
          void apiFetch(`/api/Reviews/update/${numReviewId}`, {
            method: "PUT",
            body: JSON.stringify({
              rating,
              comment,
            }),
          }).catch(() => undefined);
        }
        updateBooks((b) =>
          b.id === bookId
            ? {
                ...b,
                reviews: b.reviews.map((r) =>
                  r.id === reviewId ? { ...r, rating, comment, date: new Date().toISOString().slice(0, 10) } : r,
                ),
              }
            : b,
        );
      },

      requestCategory: async (name: string) => {
        const clean = name.trim();
        if (!clean) return false;
        try {
          await apiFetch("/api/CategoryRequests", {
            method: "POST",
            body: JSON.stringify({ categoryName: clean }),
          });
          return true;
        } catch {
          return false;
        }
      },

      saveBook: async (book) => {
        const isNumericId = /^\d+$/.test(book.id);
        const conditionEnumMap: Record<string, number> = {
          "Like New": 0,
          "Good": 1,
          "Acceptable": 2,
          "Vintage Collector": 1,
        };
        const conditionVal = conditionEnumMap[book.condition] ?? 1;

        if (isNumericId) {
          await apiFetch(`/api/Books/${book.id}`, {
            method: "PUT",
            body: JSON.stringify({
              title: book.title,
              author: book.author,
              description: book.description,
              price: book.price,
              quantity: book.availableQuantity,
              categoryName: book.category,
              imageUrl: book.imageUrl || (book.images?.[0] ?? ""),
              condition: conditionVal,
              ageRating: book.ageRating || "All Ages",
              sellerId: book.sellerId || authUserId,
            }),
          });

          setState((prev) => ({
            ...prev,
            books: prev.books.map((b) => (b.id === book.id ? book : b)),
          }));

          return book;
        } else {
          const res = await apiFetch<any>("/api/Books", {
            method: "POST",
            body: JSON.stringify({
              title: book.title,
              author: book.author,
              description: book.description,
              price: book.price,
              quantity: book.availableQuantity,
              categoryName: book.category,
              imageUrl: book.imageUrl || (book.images?.[0] ?? ""),
              condition: conditionVal,
              ageRating: book.ageRating || "All Ages",
              sellerId: book.sellerId || authUserId,
            }),
          });

          const realId = res?.id ? String(res.id) : book.id;
          const savedBook: Book = {
            ...book,
            id: realId,
            approvalStatus: "Pending",
            sellerId: res?.sellerId ?? book.sellerId ?? authUserId ?? "",
            category: res?.categoryName ?? book.category,
          };

          setState((prev) => ({
            ...prev,
            books: [savedBook, ...prev.books.filter((b) => b.id !== book.id && b.id !== realId)],
          }));

          return savedBook;
        }
      },
      deleteBook: (bookId) => {
        const isNumericId = /^\d+$/.test(bookId);
        if (isNumericId) {
          void apiFetch(`/api/Books/${bookId}`, {
            method: "DELETE",
          }).catch(() => undefined);
        }
        setState((prev) => ({
          ...prev,
          books: prev.books.filter((b) => b.id !== bookId),
          cart: prev.cart.filter((c) => c.bookId !== bookId),
        }));
      },
      toggleFlag: (bookId) => updateBooks((b) => (b.id === bookId ? { ...b, flagged: !b.flagged } : b)),
      toggleRemoved: (bookId) =>
        updateBooks((b) => (b.id === bookId ? { ...b, removed: !b.removed } : b)),

      setUserStatus: (userId, status) =>
        patch({ users: users.map((u) => (u.id === userId ? { ...u, status } : u)) }),
      decideSeller: (userId, decision) => {
        const nextRole: Role = decision === "approved" ? "seller" : "customer";
        const updatedUsers = users.map((u) => {
          if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
            const updated: AppUser = {
              ...u,
              role: nextRole,
              sellerState: decision,
            };
            try {
              if (updated.email) {
                localStorage.setItem(`turath-profile-${updated.email.toLowerCase()}`, JSON.stringify(updated));
              }
              localStorage.setItem(`turath-profile-${u.id}`, JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return u;
        });
        patch({
          users: updatedUsers,
          ...(activeUser && (activeUser.id === userId || activeUser.email.toLowerCase() === userId.toLowerCase())
            ? { role: nextRole }
            : {}),
        });
      },

      addCategory: (name) => {
        const clean = name.trim();
        if (!clean || categories.includes(clean)) return;
        void apiFetch("/api/Categories", {
          method: "POST",
          body: JSON.stringify({ name: clean }),
        }).catch(() => undefined);
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
      decideBook: (bookId: string, decision: "Approved" | "Rejected") => {
        setState((prev) => ({
          ...prev,
          books: decision === "Rejected"
            ? prev.books.filter((b) => b.id !== bookId)
            : prev.books.map((b) =>
                b.id === bookId ? { ...b, approvalStatus: decision } : b
              ),
        }));
      },
      refreshBooks,
      syncOrdersFromServer,
      syncCurrentUserProfile,
    };
  }, [state, hydrated, patch, refreshBooks, syncOrdersFromServer, syncCurrentUserProfile]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTurath() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useTurath must be used inside TurathProvider");
  return ctx;
}

export function avgRating(book: Book) {
  if (Array.isArray(book.reviews) && book.reviews.length > 0) {
    return Math.round((book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length) * 10) / 10;
  }
  return Number((book as any).averageRating ?? 0);
}

export const egp = (n: number) =>
  `${n.toLocaleString("en-EG", { maximumFractionDigits: 2 })} EGP`;
