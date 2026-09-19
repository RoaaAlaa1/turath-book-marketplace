import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//#region src/lib/turath/data.ts
var SELLER_ID = "u-seller-approved";
var PENDING_SELLER_ID = "u-seller-pending";
var CUSTOMER_ID = "u-customer";
var ADMIN_ID = "u-admin";
var initialCategories = [
	"Classic Literature",
	"Academic",
	"Rare & Antique",
	"Fiction",
	"Philosophy",
	"Children's Books"
];
var initialUsers = [
	{
		id: CUSTOMER_ID,
		name: "Roaa Alaa",
		email: "roaa@turath.co",
		role: "customer",
		status: "active",
		joined: "2025-11-02"
	},
	{
		id: "u-customer-2",
		name: "Yusuf Karim",
		email: "yusuf@turath.co",
		role: "customer",
		status: "active",
		joined: "2026-01-18"
	},
	{
		id: "u-customer-3",
		name: "Mariam Sobhy",
		email: "mariam@turath.co",
		role: "customer",
		status: "suspended",
		joined: "2026-02-09"
	},
	{
		id: SELLER_ID,
		name: "Dar Al-Warraq",
		email: "warraq@turath.co",
		role: "seller",
		sellerState: "approved",
		status: "active",
		joined: "2025-09-14"
	},
	{
		id: PENDING_SELLER_ID,
		name: "Maktabat Al-Ghusn",
		email: "ghusn@turath.co",
		role: "seller",
		sellerState: "pending",
		status: "active",
		joined: "2026-08-30"
	},
	{
		id: "u-seller-pending-2",
		name: "Sahafat Books",
		email: "sahafat@turath.co",
		role: "seller",
		sellerState: "pending",
		status: "active",
		joined: "2026-09-01"
	},
	{
		id: "u-seller-2",
		name: "Nile Rare Editions",
		email: "nile@turath.co",
		role: "seller",
		sellerState: "approved",
		status: "active",
		joined: "2025-12-21"
	},
	{
		id: ADMIN_ID,
		name: "Turath Steward",
		email: "admin@turath.co",
		role: "admin",
		status: "active",
		joined: "2025-08-01"
	}
];
var initialBooks = [
	{
		id: "b-1",
		title: "The Prophet",
		titleAr: "النبي",
		author: "Kahlil Gibran",
		price: 180,
		availableQuantity: 4,
		category: "Classic Literature",
		condition: "Like New",
		description: "A 1968 reprint of Gibran's meditations on love, work and sorrow. Pages remain supple and the gilt lettering is intact.",
		conditionNotes: "Light shelf wear on the lower spine. No markings inside.",
		sellerId: SELLER_ID,
		spine: "amber",
		images: [
			"front",
			"spine",
			"inner"
		],
		reviews: [{
			id: "r-1",
			author: "Yusuf Karim",
			rating: 5,
			comment: "Arrived wrapped in linen paper. Feels like it was cared for by someone.",
			date: "2026-06-11",
			verified: true
		}, {
			id: "r-2",
			author: "Mariam Sobhy",
			rating: 4,
			comment: "Beautiful copy, faint coffee ring on the back cover as described.",
			date: "2026-07-02",
			verified: true
		}],
		flagged: false,
		removed: false
	},
	{
		id: "b-2",
		title: "Season of Migration to the North",
		titleAr: "موسم الهجرة إلى الشمال",
		author: "Tayeb Salih",
		price: 145,
		availableQuantity: 2,
		category: "Fiction",
		condition: "Good",
		description: "Salih's landmark novel of return and rupture, in a well-read paperback edition with a former owner's inscription.",
		conditionNotes: "Inscription on the title page dated 1994. Spine creased.",
		sellerId: SELLER_ID,
		spine: "navy",
		images: ["front", "spine"],
		reviews: [{
			id: "r-3",
			author: "Roaa Alaa",
			rating: 5,
			comment: "The inscription made it feel like inheriting a friendship.",
			date: "2026-05-20",
			verified: true
		}],
		flagged: false,
		removed: false
	},
	{
		id: "b-3",
		title: "Al-Muqaddimah",
		titleAr: "المقدمة",
		author: "Ibn Khaldun",
		price: 620,
		availableQuantity: 1,
		category: "Rare & Antique",
		condition: "Vintage Collector",
		description: "Leather-bound Cairo printing with marbled endpapers. A cornerstone of historiography and social thought.",
		conditionNotes: "Hand-tooled leather, slight foxing on early leaves. Binding tight.",
		sellerId: "u-seller-2",
		spine: "crimson",
		images: [
			"front",
			"spine",
			"inner",
			"detail"
		],
		reviews: [{
			id: "r-4",
			author: "Yusuf Karim",
			rating: 5,
			comment: "Museum-grade. The marbling alone justifies the price.",
			date: "2026-03-14",
			verified: true
		}],
		flagged: false,
		removed: false
	},
	{
		id: "b-4",
		title: "Organic Chemistry, 7th Edition",
		author: "Paula Bruice",
		price: 260,
		availableQuantity: 9,
		category: "Academic",
		condition: "Acceptable",
		description: "Ex-university copy with highlighting across the reaction-mechanism chapters. All plates present.",
		conditionNotes: "Highlighting in chapters 4-11, corner bumps, cover scuffed.",
		sellerId: SELLER_ID,
		spine: "sage",
		images: ["front", "spine"],
		reviews: [],
		flagged: false,
		removed: false
	},
	{
		id: "b-5",
		title: "Meditations",
		author: "Marcus Aurelius",
		price: 95,
		availableQuantity: 6,
		category: "Philosophy",
		condition: "Good",
		description: "Pocket edition of the Stoic notebooks, carried and annotated by a previous reader in pencil.",
		conditionNotes: "Pencil marginalia throughout, erasable. Cover sunned.",
		sellerId: "u-seller-2",
		spine: "rust",
		images: [
			"front",
			"spine",
			"inner"
		],
		reviews: [{
			id: "r-5",
			author: "Mariam Sobhy",
			rating: 4,
			comment: "The previous reader's notes are half the pleasure.",
			date: "2026-04-02",
			verified: true
		}],
		flagged: false,
		removed: false
	},
	{
		id: "b-6",
		title: "Kalila wa Dimna",
		titleAr: "كليلة ودمنة",
		author: "Ibn al-Muqaffa",
		price: 130,
		availableQuantity: 5,
		category: "Children's Books",
		condition: "Like New",
		description: "Illustrated retelling of the animal fables for young readers, with full-colour plates on heavy paper.",
		conditionNotes: "One dog-eared page. Otherwise pristine.",
		sellerId: SELLER_ID,
		spine: "amber",
		images: ["front", "spine"],
		reviews: [{
			id: "r-6",
			author: "Roaa Alaa",
			rating: 5,
			comment: "Bought for my niece, ended up rereading it myself.",
			date: "2026-08-12",
			verified: true
		}],
		flagged: false,
		removed: false
	},
	{
		id: "b-7",
		title: "One Hundred Years of Solitude",
		author: "Gabriel García Márquez",
		price: 165,
		availableQuantity: 3,
		category: "Classic Literature",
		condition: "Good",
		description: "Sun-faded paperback that has travelled through three cities and four readers.",
		conditionNotes: "Faded spine, name crossed out on flyleaf.",
		sellerId: "u-seller-2",
		spine: "sage",
		images: ["front", "spine"],
		reviews: [],
		flagged: false,
		removed: false
	},
	{
		id: "b-8",
		title: "The Trial",
		author: "Franz Kafka",
		price: 110,
		availableQuantity: 0,
		category: "Fiction",
		condition: "Acceptable",
		description: "Reading copy with a repaired hinge — sturdy enough for one more reader.",
		conditionNotes: "Hinge repaired with archival tape. Text block clean.",
		sellerId: SELLER_ID,
		spine: "navy",
		images: ["front"],
		reviews: [],
		flagged: false,
		removed: false
	},
	{
		id: "b-9",
		title: "Diwan al-Mutanabbi",
		titleAr: "ديوان المتنبي",
		author: "Al-Mutanabbi",
		price: 340,
		availableQuantity: 2,
		category: "Rare & Antique",
		condition: "Vintage Collector",
		description: "Beirut printing on cream laid paper, gold-stamped boards, ribbon marker intact.",
		conditionNotes: "Gold stamping bright. Minor rubbing at corners.",
		sellerId: "u-seller-2",
		spine: "crimson",
		images: [
			"front",
			"spine",
			"detail"
		],
		reviews: [{
			id: "r-7",
			author: "Yusuf Karim",
			rating: 5,
			comment: "The paper smells like a grandfather's study. Perfect.",
			date: "2026-07-28",
			verified: true
		}],
		flagged: false,
		removed: false
	},
	{
		id: "b-10",
		title: "Principles of Economics",
		author: "N. Gregory Mankiw",
		price: 210,
		availableQuantity: 7,
		category: "Academic",
		condition: "Good",
		description: "Recent edition released back into circulation by a graduating student.",
		conditionNotes: "Clean text block, small sticker residue on cover.",
		sellerId: SELLER_ID,
		spine: "rust",
		images: ["front", "spine"],
		reviews: [],
		flagged: false,
		removed: false
	},
	{
		id: "b-11",
		title: "Being and Time",
		author: "Martin Heidegger",
		price: 275,
		availableQuantity: 2,
		category: "Philosophy",
		condition: "Like New",
		description: "Crisp translation with an unopened feel — the previous owner never got past §12.",
		conditionNotes: "Essentially unread. Slight shelf lean.",
		sellerId: "u-seller-2",
		spine: "navy",
		images: ["front", "spine"],
		reviews: [],
		flagged: false,
		removed: false
	},
	{
		id: "b-12",
		title: "The Little Prince",
		titleAr: "الأمير الصغير",
		author: "Antoine de Saint-Exupéry",
		price: 85,
		availableQuantity: 10,
		category: "Children's Books",
		condition: "Good",
		description: "Bilingual edition with the original watercolours, loved by at least two children.",
		conditionNotes: "Crayon mark on page 31. Binding sound.",
		sellerId: SELLER_ID,
		spine: "sage",
		images: [
			"front",
			"spine",
			"inner"
		],
		reviews: [{
			id: "r-8",
			author: "Mariam Sobhy",
			rating: 4,
			comment: "The crayon mark is now part of the story.",
			date: "2026-06-30",
			verified: true
		}],
		flagged: false,
		removed: false
	}
];
var initialOrders = [
	{
		id: "TRH-1041",
		customerId: CUSTOMER_ID,
		customerName: "Roaa Alaa",
		lines: [{
			bookId: "b-1",
			title: "The Prophet",
			author: "Kahlil Gibran",
			price: 180,
			quantity: 1,
			sellerId: SELLER_ID
		}],
		subtotal: 180,
		shipping: 35,
		tax: 25.2,
		total: 240.2,
		status: "Delivered",
		placedAt: "2026-06-04",
		address: "12 Al-Mu'izz St, Cairo"
	},
	{
		id: "TRH-1058",
		customerId: CUSTOMER_ID,
		customerName: "Roaa Alaa",
		lines: [{
			bookId: "b-6",
			title: "Kalila wa Dimna",
			author: "Ibn al-Muqaffa",
			price: 130,
			quantity: 2,
			sellerId: SELLER_ID
		}],
		subtotal: 260,
		shipping: 35,
		tax: 36.4,
		total: 331.4,
		status: "Shipped",
		placedAt: "2026-08-22",
		address: "12 Al-Mu'izz St, Cairo"
	},
	{
		id: "TRH-1063",
		customerId: "u-customer-2",
		customerName: "Yusuf Karim",
		lines: [{
			bookId: "b-9",
			title: "Diwan al-Mutanabbi",
			author: "Al-Mutanabbi",
			price: 340,
			quantity: 1,
			sellerId: "u-seller-2"
		}, {
			bookId: "b-4",
			title: "Organic Chemistry, 7th Edition",
			author: "Paula Bruice",
			price: 260,
			quantity: 1,
			sellerId: SELLER_ID
		}],
		subtotal: 600,
		shipping: 35,
		tax: 84,
		total: 719,
		status: "Pending",
		placedAt: "2026-09-08",
		address: "5 Nasr Rd, Alexandria"
	},
	{
		id: "TRH-1066",
		customerId: CUSTOMER_ID,
		customerName: "Roaa Alaa",
		lines: [{
			bookId: "b-5",
			title: "Meditations",
			author: "Marcus Aurelius",
			price: 95,
			quantity: 1,
			sellerId: "u-seller-2"
		}],
		subtotal: 95,
		shipping: 35,
		tax: 13.3,
		total: 143.3,
		status: "Pending",
		placedAt: "2026-09-11",
		address: "12 Al-Mu'izz St, Cairo"
	}
];
//#endregion
//#region src/lib/turath/api.ts
function apiBaseUrl() {
	return "".replace(/\/$/, "");
}
function authHeaders(includeJson = true) {
	const token = localStorage.getItem("token");
	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	if (includeJson) headers["Content-Type"] = "application/json";
	return headers;
}
function currentUserId() {
	const token = localStorage.getItem("token");
	if (!token) return null;
	try {
		const normalized = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
		const decoded = JSON.parse(atob(normalized));
		return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? decoded.nameid ?? null;
	} catch {
		return null;
	}
}
async function apiFetch(input, init) {
	const response = await fetch(`${apiBaseUrl()}${input}`, {
		...init,
		headers: {
			...authHeaders(init?.body !== void 0),
			...init?.headers ?? {}
		}
	});
	const data = (response.headers.get("content-type") ?? "").includes("application/json") ? await response.json() : await response.text();
	if (!response.ok) {
		const message = typeof data === "object" && data !== null && "message" in data ? String(data.message) : typeof data === "string" ? data : "Request failed";
		throw new Error(message);
	}
	return data;
}
//#endregion
//#region src/lib/turath/store.tsx
var STORAGE_KEY = "turath-state-v2";
var defaults = {
	role: "customer",
	authUserId: null,
	books: [],
	users: initialUsers,
	orders: initialOrders,
	categories: [],
	cart: [],
	wishlist: []
};
var StoreContext = createContext(null);
var TAX_RATE = .14;
var roleLabels = {
	customer: {
		en: "Customer",
		ar: "قارئ"
	},
	seller: {
		en: "Approved Seller",
		ar: "بائع معتمد"
	},
	pendingSeller: {
		en: "Pending Seller",
		ar: "بائع قيد المراجعة"
	},
	admin: {
		en: "Administrator",
		ar: "مشرف"
	}
};
var SELLER_FALLBACK_MAP = {
	"e89be4a0-a929-48f1-aab9-a611b58f6be1": "Turath Foundation",
	"e89be4a0-a929-48f1-aab9-a611b58f6be2": "Dar Al-Maaref Publishing",
	"e89be4a0-a929-48f1-aab9-a611b58f6be3": "Alexandria Library Trust",
	"e89be4a0-a929-48f1-aab9-a611b58f6be4": "Youssef Mansour",
	"e89be4a0-a929-48f1-aab9-a611b58f6be5": "Mona El-Khatib",
	"e89be4a0-a929-48f1-aab9-a611b58f6be6": "Tarek Hegazy"
};
function decodeTokenRole() {
	const token = localStorage.getItem("token");
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		const rawRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? payload.role;
		if (!rawRole) return null;
		const normalized = String(rawRole).toLowerCase();
		if (normalized === "admin") return "admin";
		if (normalized === "seller") return "seller";
		return "customer";
	} catch {
		return null;
	}
}
function TurathProvider({ children }) {
	const [state, setState] = useState(defaults);
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) setState({
				...defaults,
				...JSON.parse(raw)
			});
		} catch {}
		setHydrated(true);
	}, []);
	useEffect(() => {
		if (!hydrated) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}, [state, hydrated]);
	const patch = useCallback((p) => setState((s) => ({
		...s,
		...p
	})), []);
	useEffect(() => {
		if (!hydrated) return;
		let active = true;
		const fallbackBooks = state.books.length > 0 ? state.books : initialBooks;
		const fallbackCategories = state.categories.length > 0 ? state.categories : initialCategories;
		Promise.all([apiFetch("/api/Books").then((data) => Array.isArray(data) ? data.map((item) => ({
			id: String(item.id),
			title: item.title ?? "Untitled",
			titleAr: item.titleAr ?? void 0,
			author: item.author ?? "Unknown",
			price: Number(item.price ?? 0),
			availableQuantity: Number(item.quantity ?? item.availableQuantity ?? 0),
			category: item.categoryName ?? item.category ?? "General",
			condition: item.condition ?? "Good",
			description: item.description ?? "",
			conditionNotes: item.conditionNotes ?? "",
			sellerId: item.sellerId ?? "",
			sellerName: item.sellerName || SELLER_FALLBACK_MAP[item.sellerId] || "Verified Seller",
			spine: item.spine ?? [
				"rust",
				"navy",
				"amber",
				"sage",
				"crimson"
			][Math.abs(Number(item.id)) % 5],
			images: [item.imageUrl ?? ""].filter((url) => Boolean(url) && url !== "__REAL_COVER_URL_REQUIRED__"),
			imageUrl: item.imageUrl ?? "",
			reviews: Array.isArray(item.reviews) ? item.reviews : [],
			flagged: false,
			removed: false,
			ageRating: item.ageRating ?? "All Ages",
			approvalStatus: item.approvalStatus ?? "Approved"
		})) : []).catch(() => []), apiFetch("/api/Categories").then((data) => Array.isArray(data) ? data.map((item) => item.name ?? item.title ?? item.category ?? "General") : []).catch(() => [])]).then(([books, categories]) => {
			if (!active) return;
			patch({
				books: books.length > 0 ? books : fallbackBooks,
				categories: categories.length > 0 ? categories : fallbackCategories
			});
		}).catch(() => {
			if (!active) return;
			patch({
				books: fallbackBooks,
				categories: fallbackCategories
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
			const data = await apiFetch(`/api/Orders/${userId}`);
			if (Array.isArray(data)) {
				const mappedOrders = data.map((o) => ({
					id: String(o.id ?? o.orderId),
					customerId: o.customerId ?? userId,
					customerName: o.customerName ?? "Customer",
					lines: (o.orderItems ?? o.items ?? o.lines ?? []).map((item) => ({
						bookId: String(item.productId ?? item.bookId),
						title: item.title ?? item.bookTitle ?? "Book",
						author: item.author ?? "",
						price: Number(item.unitPrice ?? item.price ?? 0),
						quantity: Number(item.quantity ?? 1),
						sellerId: item.sellerId ?? ""
					})),
					subtotal: Number(o.subtotal ?? o.totalPrice ?? o.total ?? 0),
					shipping: Number(o.shipping ?? 35),
					tax: Number(o.tax ?? 0),
					total: Number(o.totalPrice ?? o.total ?? 0),
					status: o.status ?? "Pending",
					placedAt: o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					address: o.shippingAddress ?? o.address ?? "Cairo, Egypt"
				}));
				patch({ orders: mappedOrders });
			}
		} catch {}
	}, [state.authUserId, patch]);
	const syncWishlist = useCallback(async () => {
		const userId = currentUserId() || state.authUserId;
		if (!userId) return;
		try {
			const data = await apiFetch("/api/Wishlist");
			if (Array.isArray(data)) {
				patch({ wishlist: data.map((item) => String(item.bookId ?? item.productId ?? item)) });
				return;
			}
		} catch {
			const saved = localStorage.getItem(`turath-wishlist-${userId}`);
			if (saved) try {
				patch({ wishlist: JSON.parse(saved) });
			} catch {}
		}
	}, [state.authUserId, patch]);
	useEffect(() => {
		if (!hydrated) return;
		if (state.authUserId) {
			syncOrdersFromServer();
			syncWishlist();
		}
	}, [
		hydrated,
		state.authUserId,
		syncOrdersFromServer,
		syncWishlist
	]);
	useEffect(() => {
		if (!hydrated || !state.authUserId) return;
		localStorage.setItem(`turath-wishlist-${state.authUserId}`, JSON.stringify(state.wishlist));
	}, [
		hydrated,
		state.authUserId,
		state.wishlist
	]);
	const syncCartFromServer = useCallback(async () => {
		const userId = currentUserId();
		if (!userId) return;
		try {
			const payload = await apiFetch(`/api/Cart/${userId}`);
			const nextCart = (payload.cartItems ?? payload.items ?? []).map((item) => ({
				bookId: String(item.productId ?? item.id ?? ""),
				quantity: Number(item.quantity ?? 0)
			})).filter((item) => item.bookId && item.quantity > 0);
			patch({ cart: nextCart });
		} catch {}
	}, [patch]);
	useEffect(() => {
		if (!hydrated) return;
		syncCartFromServer();
	}, [
		hydrated,
		state.authUserId,
		syncCartFromServer
	]);
	const value = useMemo(() => {
		const { books, users, orders, categories, cart, wishlist, role, authUserId } = state;
		const activeUser = authUserId ? users.find((u) => u.id === authUserId) ?? users.find((u) => u.email === localStorage.getItem("turath-email")) ?? null : null;
		const bookById = (id) => books.find((b) => b.id === id);
		const updateBooks = (fn) => patch({ books: books.map(fn) });
		return {
			...state,
			hydrated,
			activeUser,
			isAuthenticated: Boolean(authUserId),
			setRole: (r) => patch({
				role: r,
				authUserId: null,
				cart: []
			}),
			signOut: () => {
				localStorage.removeItem("token");
				localStorage.removeItem("turath-email");
				patch({
					authUserId: null,
					role: "customer",
					cart: [],
					wishlist: []
				});
			},
			registerUser: (user) => {
				const created = {
					...user,
					id: `u-${Date.now()}`,
					joined: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					status: "active"
				};
				const realRole = decodeTokenRole() ?? "customer";
				const authenticatedId = currentUserId() ?? created.id;
				const authenticatedUser = {
					...created,
					id: authenticatedId,
					role: realRole
				};
				localStorage.setItem("turath-email", user.email);
				patch({
					users: [authenticatedUser, ...users.filter((existing) => existing.email.toLowerCase() !== user.email.toLowerCase())],
					authUserId: authenticatedId,
					role: realRole
				});
				return authenticatedUser;
			},
			signIn: (email) => {
				const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
				if (!user || user.status === "suspended") return false;
				const realRole = decodeTokenRole() ?? "customer";
				const authenticatedId = currentUserId() ?? user.id;
				localStorage.setItem("turath-email", user.email);
				patch({
					users: users.map((existing) => existing.id === user.id ? {
						...existing,
						id: authenticatedId,
						role: realRole
					} : existing),
					authUserId: authenticatedId,
					role: realRole
				});
				return true;
			},
			updateProfile: (userId, profile) => patch({ users: users.map((u) => u.id === userId ? {
				...u,
				...profile
			} : u) }),
			resetAll: () => {
				localStorage.removeItem(STORAGE_KEY);
				localStorage.removeItem("token");
				setState(defaults);
			},
			visibleBooks: books.filter((b) => !b.removed),
			bookById,
			sellerName: (id, directName) => directName || SELLER_FALLBACK_MAP[id] || users.find((u) => u.id === id)?.name || "Verified Seller",
			addToCart: (bookId, qty = 1) => {
				const book = bookById(bookId);
				if (!book) return;
				const existing = cart.find((c) => c.bookId === bookId);
				const next = Math.min((existing?.quantity ?? 0) + qty, book.availableQuantity);
				if (next <= 0) return;
				patch({ cart: existing ? cart.map((c) => c.bookId === bookId ? {
					...c,
					quantity: next
				} : c) : [...cart, {
					bookId,
					quantity: next
				}] });
				const userId = currentUserId();
				if (userId) apiFetch(`/api/Cart/add`, {
					method: "POST",
					body: JSON.stringify({
						customerId: userId,
						productId: Number(bookId),
						quantity: qty
					})
				}).catch(() => void 0);
			},
			setCartQty: (bookId, qty) => {
				const book = bookById(bookId);
				if (!book) return;
				const clamped = Math.max(1, Math.min(qty, book.availableQuantity));
				patch({ cart: cart.map((c) => c.bookId === bookId ? {
					...c,
					quantity: clamped
				} : c) });
				const userId = currentUserId();
				if (userId) apiFetch(`/api/Cart/update-item`, {
					method: "PUT",
					body: JSON.stringify({
						customerId: userId,
						productId: Number(bookId),
						quantity: clamped
					})
				}).catch(() => void 0);
			},
			removeFromCart: (bookId) => {
				patch({ cart: cart.filter((c) => c.bookId !== bookId) });
				const userId = currentUserId();
				if (userId) apiFetch(`/api/Cart/remove-item`, {
					method: "DELETE",
					body: JSON.stringify({
						customerId: userId,
						productId: Number(bookId)
					})
				}).catch(() => void 0);
			},
			clearCart: () => patch({ cart: [] }),
			toggleWishlist: (bookId) => {
				const saved = wishlist.includes(bookId);
				patch({ wishlist: saved ? wishlist.filter((w) => w !== bookId) : [...wishlist, bookId] });
				if (currentUserId()) apiFetch(saved ? `/api/Wishlist/remove/${bookId}` : "/api/Wishlist/add", saved ? { method: "DELETE" } : {
					method: "POST",
					body: JSON.stringify({ bookId: Number(bookId) })
				}).catch(() => void 0);
			},
			placeOrder: async (address) => {
				const lines = cart.map((c) => {
					const b = bookById(c.bookId);
					if (!b) return null;
					return {
						bookId: b.id,
						title: b.title,
						author: b.author,
						price: b.price,
						quantity: Math.min(c.quantity, b.availableQuantity),
						sellerId: b.sellerId
					};
				}).filter(Boolean);
				if (!lines.length) return null;
				const userId = currentUserId();
				if (userId) try {
					const result = await apiFetch(`/api/Cart/checkout`, {
						method: "POST",
						body: JSON.stringify({ customerId: userId })
					});
					const realId = String(result?.id ?? result?.orderId ?? "");
					const realTotal = Number(result?.total ?? result?.totalPrice ?? 0);
					if (realId) {
						const order = {
							id: realId,
							customerId: userId,
							customerName: activeUser?.name ?? "Customer",
							lines,
							subtotal: realTotal,
							shipping: 0,
							tax: 0,
							total: realTotal,
							status: "Pending",
							placedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
							address
						};
						patch({
							orders: [order, ...orders],
							cart: []
						});
						syncOrdersFromServer();
						return realId;
					}
				} catch {}
				const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
				const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
				const id = `MOCK-${1100 + orders.length}`;
				const order = {
					id,
					customerId: activeUser?.id ?? "guest",
					customerName: activeUser?.name ?? "Customer",
					lines,
					subtotal,
					shipping: 35,
					tax,
					total: Math.round((subtotal + 35 + tax) * 100) / 100,
					status: "Pending",
					placedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					address
				};
				patch({
					orders: [order, ...orders],
					cart: [],
					books: books.map((b) => {
						const line = lines.find((l) => l.bookId === b.id);
						return line ? {
							...b,
							availableQuantity: Math.max(0, b.availableQuantity - line.quantity)
						} : b;
					})
				});
				return id;
			},
			cancelOrder: (orderId) => {
				if (currentUserId()) apiFetch(`/api/Orders/${orderId}/cancel`, { method: "PATCH" }).catch(() => void 0);
				patch({ orders: orders.map((o) => o.id === orderId && o.status === "Pending" ? {
					...o,
					status: "Cancelled"
				} : o) });
			},
			setOrderStatus: (orderId, status) => patch({ orders: orders.map((o) => o.id === orderId ? {
				...o,
				status
			} : o) }),
			addReview: (bookId, review) => updateBooks((b) => b.id === bookId ? {
				...b,
				reviews: [{
					...review,
					id: `r-${Date.now()}`,
					date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
				}, ...b.reviews]
			} : b),
			saveBook: (book) => patch({ books: books.some((b) => b.id === book.id) ? books.map((b) => b.id === book.id ? book : b) : [book, ...books] }),
			deleteBook: (bookId) => patch({
				books: books.filter((b) => b.id !== bookId),
				cart: cart.filter((c) => c.bookId !== bookId)
			}),
			toggleFlag: (bookId) => updateBooks((b) => b.id === bookId ? {
				...b,
				flagged: !b.flagged
			} : b),
			toggleRemoved: (bookId) => updateBooks((b) => b.id === bookId ? {
				...b,
				removed: !b.removed
			} : b),
			setUserStatus: (userId, status) => patch({ users: users.map((u) => u.id === userId ? {
				...u,
				status
			} : u) }),
			decideSeller: (userId, decision) => patch({ users: users.map((u) => u.id === userId ? {
				...u,
				sellerState: decision
			} : u) }),
			addCategory: (name) => {
				const clean = name.trim();
				if (!clean || categories.includes(clean)) return;
				patch({ categories: [...categories, clean] });
			},
			renameCategory: (oldName, newName) => {
				const clean = newName.trim();
				if (!clean) return;
				patch({
					categories: categories.map((c) => c === oldName ? clean : c),
					books: books.map((b) => b.category === oldName ? {
						...b,
						category: clean
					} : b)
				});
			},
			removeCategory: (name) => patch({ categories: categories.filter((c) => c !== name) })
		};
	}, [
		state,
		hydrated,
		patch
	]);
	return /* @__PURE__ */ jsx(StoreContext.Provider, {
		value,
		children
	});
}
function useTurath() {
	const ctx = useContext(StoreContext);
	if (!ctx) throw new Error("useTurath must be used inside TurathProvider");
	return ctx;
}
function avgRating(book) {
	if (!book.reviews.length) return 0;
	return book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length;
}
var egp = (n) => `${n.toLocaleString("en-EG", { maximumFractionDigits: 2 })} EGP`;
//#endregion
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/badge.tsx
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
//#region src/components/turath/Ornaments.tsx
function BranchDivider({ className = "" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `flex items-center justify-center gap-3 text-primary/60 ${className}`,
		children: [
			/* @__PURE__ */ jsx("span", { className: "h-px w-16 bg-gradient-to-r from-transparent to-current sm:w-28" }),
			/* @__PURE__ */ jsxs("svg", {
				viewBox: "0 0 120 24",
				className: "h-6 w-28 shrink-0",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ jsxs("g", {
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.2",
					strokeLinecap: "round",
					children: [
						/* @__PURE__ */ jsx("path", { d: "M6 12h30M84 12h30" }),
						/* @__PURE__ */ jsx("path", { d: "M40 12c4-6 10-6 14 0-4 6-10 6-14 0Z" }),
						/* @__PURE__ */ jsx("path", { d: "M66 12c4-6 10-6 14 0-4 6-10 6-14 0Z" }),
						/* @__PURE__ */ jsx("path", { d: "M60 5v14M54 9l6 3M66 9l-6 3" })
					]
				}), /* @__PURE__ */ jsx("circle", {
					cx: "60",
					cy: "12",
					r: "2",
					fill: "currentColor"
				})]
			}),
			/* @__PURE__ */ jsx("span", { className: "h-px w-16 bg-gradient-to-l from-transparent to-current sm:w-28" })
		]
	});
}
function LeafSprig({ className = "" }) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 64 64",
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round",
			children: [/* @__PURE__ */ jsx("path", { d: "M32 60C32 40 24 20 8 8" }), /* @__PURE__ */ jsx("path", { d: "M26 44c-8 2-14-2-16-8 7-2 13 1 16 8ZM22 32c-7 1-12-3-13-9 6-1 11 2 13 9ZM30 52c6-4 7-11 4-16-5 3-7 10-4 16Z" })]
		})
	});
}
//#endregion
export { TAX_RATE as a, egp as c, apiFetch as d, cn as i, roleLabels as l, LeafSprig as n, TurathProvider as o, Badge as r, avgRating as s, BranchDivider as t, useTurath as u };
