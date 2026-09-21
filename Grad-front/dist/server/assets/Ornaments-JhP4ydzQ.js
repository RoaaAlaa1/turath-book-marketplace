import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
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
	},
	{
		id: "u-admin-com",
		name: "Turath Steward",
		email: "admin@turath.com",
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
		reviews: [
			{
				id: "r-1",
				author: "Yusuf Karim",
				rating: 5,
				comment: "Arrived wrapped in linen paper. Feels like it was cared for by someone.",
				date: "2026-06-11",
				verified: true
			},
			{
				id: "r-2",
				author: "Mariam Sobhy",
				rating: 4,
				comment: "Beautiful copy, faint coffee ring on the back cover as described.",
				date: "2026-07-02",
				verified: true
			},
			{
				id: "r-23",
				author: "Farida El-Gendy",
				rating: 5,
				comment: "Gibran's poetic reflections are timeless. Gilt lettering on the spine is stunning.",
				date: "2026-08-14",
				verified: true
			},
			{
				id: "r-24",
				author: "Ziad Mahmoud",
				rating: 4,
				comment: "Very clean interior with supple, age-toned pages. Excellent condition.",
				date: "2026-09-04",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-3",
				author: "Roaa Alaa",
				rating: 5,
				comment: "The inscription made it feel like inheriting a friendship.",
				date: "2026-05-20",
				verified: true
			},
			{
				id: "r-25",
				author: "Hana Rostom",
				rating: 5,
				comment: "A masterpiece of Arab literature. Fast delivery and eco-friendly packing.",
				date: "2026-07-18",
				verified: true
			},
			{
				id: "r-26",
				author: "Dr. Tarek Hegazy",
				rating: 4,
				comment: "Authentic pre-loved paperback with sturdy binding and clear print.",
				date: "2026-08-22",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-4",
				author: "Yusuf Karim",
				rating: 5,
				comment: "Museum-grade. The marbling alone justifies the price.",
				date: "2026-03-14",
				verified: true
			},
			{
				id: "r-27",
				author: "Prof. Adel Mansour",
				rating: 5,
				comment: "Hand-tooled leather binding in superb state. A genuine historical gem.",
				date: "2026-06-25",
				verified: true
			},
			{
				id: "r-28",
				author: "Nour Al-Din",
				rating: 5,
				comment: "Packaging was impenetrable and the book condition exceeded expectations.",
				date: "2026-08-30",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-9",
				author: "Omar Farouk",
				rating: 4,
				comment: "Detailed margin highlights in reaction mechanisms actually helped my study session.",
				date: "2026-08-04",
				verified: true
			},
			{
				id: "r-10",
				author: "Sarah Nabil",
				rating: 3,
				comment: "Cover shows noticeable shelf wear as described, but all text pages and diagrams are fully intact.",
				date: "2026-07-19",
				verified: true
			},
			{
				id: "r-29",
				author: "Nada El-Sayed",
				rating: 4,
				comment: "Mechanism flowcharts were very clear. Saved me money on a brand new copy.",
				date: "2026-08-28",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-5",
				author: "Mariam Sobhy",
				rating: 4,
				comment: "The previous reader's notes are half the pleasure.",
				date: "2026-04-02",
				verified: true
			},
			{
				id: "r-11",
				author: "Karim Sami",
				rating: 5,
				comment: "Timeless stoic companion. Fits easily in a jacket pocket.",
				date: "2026-08-15",
				verified: true
			},
			{
				id: "r-12",
				author: "Hoda Mostafa",
				rating: 4,
				comment: "Smooth paper and comfortable font size for evening reading.",
				date: "2026-09-01",
				verified: true
			},
			{
				id: "r-30",
				author: "Amr Khaled",
				rating: 5,
				comment: "Essential reading. The pencil notes from the previous reader added so much depth.",
				date: "2026-09-05",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-6",
				author: "Roaa Alaa",
				rating: 5,
				comment: "Bought for my niece, ended up rereading it myself.",
				date: "2026-08-12",
				verified: true
			},
			{
				id: "r-13",
				author: "Salma Sherif",
				rating: 5,
				comment: "Vibrant illustrations and clear Arabic typesetting. A family heirloom.",
				date: "2026-09-03",
				verified: true
			},
			{
				id: "r-31",
				author: "Lina Badr",
				rating: 4,
				comment: "My children loved the animal fables and the illustrations are gorgeous.",
				date: "2026-09-09",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-14",
				author: "Youssef Mansour",
				rating: 5,
				comment: "The translation captures Márquez's magical realism effortlessly. Clean binding.",
				date: "2026-07-14",
				verified: true
			},
			{
				id: "r-15",
				author: "Dina Fouad",
				rating: 4,
				comment: "A book with a soul. Arrived safely in eco-friendly packaging.",
				date: "2026-08-20",
				verified: true
			},
			{
				id: "r-32",
				author: "Sherif Ezzat",
				rating: 5,
				comment: "A masterpiece. Arrived on time and in great reading condition.",
				date: "2026-09-06",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-16",
				author: "Dr. Tarek Hegazy",
				rating: 4,
				comment: "Archival tape repair on the hinge is neat and sturdy. Excellent vintage character.",
				date: "2026-06-18",
				verified: true
			},
			{
				id: "r-33",
				author: "Yusuf Karim",
				rating: 4,
				comment: "Kafka's prose is as haunting as ever. The repaired hinge is completely secure.",
				date: "2026-07-22",
				verified: true
			},
			{
				id: "r-34",
				author: "Mostafa Radi",
				rating: 4,
				comment: "Great paperback copy, arrived safely and carefully packaged.",
				date: "2026-08-30",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-7",
				author: "Yusuf Karim",
				rating: 5,
				comment: "The paper smells like a grandfather's study. Perfect.",
				date: "2026-07-28",
				verified: true
			},
			{
				id: "r-17",
				author: "Roaa Alaa",
				rating: 5,
				comment: "Remarkable poetic edition. The ribbon marker and gold stamping are completely intact.",
				date: "2026-08-10",
				verified: true
			},
			{
				id: "r-35",
				author: "Mariam Sobhy",
				rating: 5,
				comment: "The classical Arabic commentary in the margins is pure treasure.",
				date: "2026-09-02",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-18",
				author: "Ahmed Reda",
				rating: 4,
				comment: "Crisp graphs and problem sets. Perfect for my macroeconomics coursework.",
				date: "2026-08-25",
				verified: true
			},
			{
				id: "r-19",
				author: "Nour Al-Din",
				rating: 4,
				comment: "Prompt delivery and exactly matches the syllabus edition.",
				date: "2026-09-02",
				verified: true
			},
			{
				id: "r-36",
				author: "Hany Mansour",
				rating: 4,
				comment: "Standard university textbook in solid condition at a fraction of the original price.",
				date: "2026-09-10",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-20",
				author: "Dr. Tarek Hegazy",
				rating: 5,
				comment: "Immaculate condition, virtually unread with sharp corners and spine.",
				date: "2026-08-29",
				verified: true
			},
			{
				id: "r-21",
				author: "Omar Adel",
				rating: 4,
				comment: "Excellent translation and great notes on ontology.",
				date: "2026-09-08",
				verified: true
			},
			{
				id: "r-37",
				author: "Dr. Mona El-Khatib",
				rating: 5,
				comment: "A cornerstone of continental philosophy. Excellent edition and swift shipping.",
				date: "2026-09-12",
				verified: true
			}
		],
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
		reviews: [
			{
				id: "r-8",
				author: "Mariam Sobhy",
				rating: 4,
				comment: "The crayon mark is now part of the story.",
				date: "2026-06-30",
				verified: true
			},
			{
				id: "r-22",
				author: "Layla Hassan",
				rating: 5,
				comment: "Charming bilingual format, lovely for reading before bedtime.",
				date: "2026-08-19",
				verified: true
			},
			{
				id: "r-38",
				author: "Farah Nabil",
				rating: 5,
				comment: "Delightful bedtime book with original watercolor illustrations.",
				date: "2026-09-01",
				verified: true
			},
			{
				id: "r-39",
				author: "Roaa Alaa",
				rating: 5,
				comment: "One of my all time favorites. Arrived in beautiful condition.",
				date: "2026-09-07",
				verified: true
			}
		],
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
function getStoredToken() {
	if (typeof localStorage === "undefined") return null;
	return localStorage.getItem("token");
}
function authHeaders(includeJson = true) {
	const token = getStoredToken();
	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	if (includeJson) headers["Content-Type"] = "application/json";
	return headers;
}
function safeDecodeJwtPayload(token) {
	if (!token) return null;
	try {
		const parts = token.split(".");
		if (parts.length < 2) return null;
		let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		while (base64.length % 4 !== 0) base64 += "=";
		const jsonStr = decodeURIComponent(atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
		return JSON.parse(jsonStr);
	} catch {
		try {
			let base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
			while (base64.length % 4 !== 0) base64 += "=";
			return JSON.parse(atob(base64));
		} catch {
			return null;
		}
	}
}
function currentUserId() {
	const decoded = safeDecodeJwtPayload(getStoredToken());
	if (!decoded) return null;
	return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? decoded.nameid ?? decoded.sub ?? decoded.uid ?? decoded.userId ?? null;
}
function currentUserRoles() {
	const decoded = safeDecodeJwtPayload(getStoredToken());
	if (!decoded) return [];
	const raw = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? decoded.role ?? decoded.roles;
	return Array.isArray(raw) ? raw : raw ? [raw] : [];
}
async function apiFetch(input, init) {
	const response = await fetch(`${apiBaseUrl()}${input}`, {
		...init,
		headers: {
			...authHeaders(init?.body !== void 0),
			...init?.headers ?? {}
		}
	});
	const text = await response.text();
	let data = null;
	if (text && text.trim().length > 0) try {
		data = JSON.parse(text);
	} catch {
		data = text;
	}
	if (!response.ok) {
		const message = typeof data === "object" && data !== null && "message" in data ? String(data.message) : typeof data === "object" && data !== null && "title" in data ? String(data.title) : typeof data === "string" && data.trim().length > 0 ? data : response.statusText || `Request failed with status ${response.status}`;
		throw new Error(message);
	}
	return data ?? {};
}
//#endregion
//#region src/lib/turath/store.tsx
var STORAGE_KEY = "turath-state-v3";
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
var USER_FALLBACK_MAP = {
	"u-customer": "Roaa Alaa",
	"u-customer-2": "Yusuf Karim",
	"u-customer-3": "Mariam Sobhy",
	"u-seller-approved": "Dar Al-Warraq",
	"u-seller-pending": "Maktabat Al-Ghusn",
	"u-seller-pending-2": "Sahafat Books",
	"u-seller-2": "Nile Rare Editions",
	"u-admin": "Turath Steward",
	"u-admin-com": "Turath Steward",
	...SELLER_FALLBACK_MAP
};
function isIdString(s) {
	if (!s || typeof s !== "string") return false;
	const trimmed = s.trim();
	if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return true;
	if (/^u-[a-z0-9_-]+/i.test(trimmed)) return true;
	if (/^r-[a-z0-9_-]+/i.test(trimmed)) return true;
	if (/^[0-9]{4,}$/.test(trimmed)) return true;
	return false;
}
function resolveUserName(raw, usersList) {
	if (!raw || typeof raw !== "string") return "Turath Reader";
	const trimmed = raw.trim();
	if (!trimmed) return "Turath Reader";
	if (USER_FALLBACK_MAP[trimmed]) return USER_FALLBACK_MAP[trimmed];
	if (usersList && usersList.length > 0) {
		const found = usersList.find((u) => u.id === trimmed || u.email?.toLowerCase() === trimmed.toLowerCase() || u.name?.toLowerCase() === trimmed.toLowerCase());
		if (found && found.name && !isIdString(found.name)) return found.name;
	}
	if (trimmed.includes("@")) {
		const prefix = trimmed.split("@")[0].replace(/[._-]/g, " ");
		return prefix.charAt(0).toUpperCase() + prefix.slice(1);
	}
	if (isIdString(trimmed)) return "Turath Reader";
	return trimmed;
}
function decodeTokenRole() {
	const roles = currentUserRoles().map((r) => String(r).toLowerCase());
	if (roles.includes("admin")) return "admin";
	if (roles.includes("seller")) return "seller";
	if (roles.length > 0) return "customer";
	return null;
}
function TurathProvider({ children }) {
	const [state, setState] = useState(defaults);
	const [hydrated, setHydrated] = useState(false);
	const stateRef = useRef(state);
	stateRef.current = state;
	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) setState({
				...defaults,
				...JSON.parse(raw)
			});
			const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
			if (raw) {
				const parsed = JSON.parse(raw);
				if (!token) {
					parsed.authUserId = null;
					parsed.role = "customer";
				}
				setState({
					...defaults,
					...parsed
				});
			} else setState(defaults);
		} catch {}
		setHydrated(true);
	}, []);
	useEffect(() => {
		if (!hydrated) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		const toSave = !(typeof localStorage !== "undefined" ? localStorage.getItem("token") : null) ? {
			...state,
			authUserId: null,
			role: "customer"
		} : state;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
	}, [state, hydrated]);
	const patch = useCallback((p) => setState((s) => ({
		...s,
		...p
	})), []);
	const refreshBooks = useCallback(async () => {
		const currentState = stateRef.current;
		const fallbackBooks = currentState.books.length > 0 ? currentState.books : initialBooks;
		const fallbackCategories = currentState.categories.length > 0 ? currentState.categories : initialCategories;
		const mapBookDto = (item) => ({
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
			reviews: Array.isArray(item.reviews) && item.reviews.length > 0 ? item.reviews.map((r) => {
				const name = r.customerName && !isIdString(r.customerName) ? r.customerName : resolveUserName(r.customerName || r.customerId || r.author, stateRef.current.users);
				return {
					id: String(r.id ?? `r-${Date.now()}`),
					author: name,
					rating: Number(r.rating ?? 5),
					comment: r.comment ?? "",
					date: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : "Recently",
					verified: true
				};
			}) : initialBooks.find((ib) => String(ib.id) === String(item.id) || ib.title.toLowerCase() === (item.title ?? "").toLowerCase())?.reviews ?? [],
			flagged: false,
			removed: false,
			ageRating: item.ageRating ?? "All Ages",
			approvalStatus: item.approvalStatus ? typeof item.approvalStatus === "string" ? item.approvalStatus : [
				"Pending",
				"Approved",
				"Rejected"
			][item.approvalStatus] ?? "Approved" : "Approved"
		});
		const hasToken = typeof localStorage !== "undefined" && Boolean(localStorage.getItem("token"));
		const isAdminUser = decodeTokenRole() === "admin";
		const minePromise = hasToken ? apiFetch("/api/Books/mine").catch(() => []) : Promise.resolve([]);
		const adminPendingPromise = isAdminUser ? apiFetch("/api/Admin/books/pending").catch(() => []) : Promise.resolve([]);
		try {
			const [booksData, categoriesData, mineData, adminPendingData] = await Promise.all([
				apiFetch("/api/Books").catch(() => []),
				apiFetch("/api/Categories").catch(() => []),
				minePromise,
				adminPendingPromise
			]);
			const publicBooks = Array.isArray(booksData) ? booksData.map(mapBookDto) : [];
			const myBooks = Array.isArray(mineData) ? mineData.map(mapBookDto) : [];
			const adminPendingBooks = Array.isArray(adminPendingData) ? adminPendingData.map((b) => ({
				...mapBookDto(b),
				approvalStatus: "Pending"
			})) : [];
			const bookMap = /* @__PURE__ */ new Map();
			for (const b of publicBooks) bookMap.set(b.id, b);
			for (const b of myBooks) if (b.approvalStatus !== "Rejected") bookMap.set(b.id, b);
			for (const b of adminPendingBooks) bookMap.set(b.id, b);
			for (const b of stateRef.current.books) if (!bookMap.has(b.id) && b.approvalStatus === "Pending") bookMap.set(b.id, b);
			const combinedBooks = Array.from(bookMap.values());
			const categories = Array.isArray(categoriesData) ? categoriesData.map((item) => item.name ?? item.title ?? item.category ?? "General") : [];
			setState((prev) => ({
				...prev,
				books: combinedBooks.length > 0 ? combinedBooks : prev.books.length > 0 ? prev.books : fallbackBooks,
				categories: categories.length > 0 ? categories : prev.categories.length > 0 ? prev.categories : fallbackCategories
			}));
		} catch {
			setState((prev) => ({
				...prev,
				books: prev.books.length > 0 ? prev.books : fallbackBooks,
				categories: prev.categories.length > 0 ? prev.categories : fallbackCategories
			}));
		}
	}, []);
	useEffect(() => {
		if (!hydrated) return;
		refreshBooks();
	}, [hydrated, refreshBooks]);
	const syncOrdersFromServer = useCallback(async () => {
		const userId = currentUserId() || stateRef.current.authUserId;
		if (!userId) return;
		try {
			const data = await apiFetch(`/api/Orders`);
			if (Array.isArray(data)) {
				const mappedOrders = data.map((o) => ({
					id: String(o.id ?? o.orderId),
					customerId: String(o.customerId ?? userId),
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
				setState((prev) => ({
					...prev,
					orders: mappedOrders
				}));
				localStorage.setItem(`turath-orders-${userId}`, JSON.stringify(mappedOrders));
			}
		} catch {
			const saved = localStorage.getItem(`turath-orders-${userId}`);
			if (saved) try {
				const parsed = JSON.parse(saved);
				setState((prev) => ({
					...prev,
					orders: parsed
				}));
			} catch {}
		}
	}, []);
	const syncWishlist = useCallback(async () => {
		const userId = currentUserId() || stateRef.current.authUserId;
		if (!userId) return;
		try {
			const data = await apiFetch("/api/Wishlist");
			if (Array.isArray(data)) {
				const ids = data.map((item) => String(item.bookId ?? item.productId ?? item.id ?? item));
				setState((prev) => ({
					...prev,
					wishlist: ids
				}));
				localStorage.setItem(`turath-wishlist-${userId}`, JSON.stringify(ids));
				return;
			}
		} catch {
			const saved = localStorage.getItem(`turath-wishlist-${userId}`);
			if (saved) try {
				const parsed = JSON.parse(saved);
				setState((prev) => ({
					...prev,
					wishlist: parsed
				}));
			} catch {}
		}
	}, []);
	const syncCartFromServer = useCallback(async () => {
		const userId = currentUserId() || stateRef.current.authUserId;
		if (!userId) return;
		try {
			const payload = await apiFetch(`/api/Cart/${userId}`);
			const nextCart = (payload.cartItems ?? payload.items ?? []).map((item) => ({
				bookId: String(item.productId ?? item.id ?? ""),
				quantity: Number(item.quantity ?? 0)
			})).filter((item) => item.bookId && item.quantity > 0);
			if (nextCart.length > 0) setState((prev) => ({
				...prev,
				cart: nextCart
			}));
		} catch {}
	}, []);
	const syncCurrentUserProfile = useCallback(async () => {
		if (!(typeof localStorage !== "undefined" ? localStorage.getItem("token") : null)) return;
		try {
			const res = await apiFetch("/api/Auth/me");
			if (res && res.id) {
				if (res.token) localStorage.setItem("token", res.token);
				if (res.email) localStorage.setItem("turath-email", res.email);
				const updatedUser = {
					id: res.id,
					name: res.name || res.username || res.email,
					email: res.email,
					role: res.role,
					sellerState: res.sellerState,
					status: "active",
					joined: "Member",
					phone: res.phoneNumber
				};
				try {
					localStorage.setItem(`turath-profile-${res.id}`, JSON.stringify(updatedUser));
					if (res.email) localStorage.setItem(`turath-profile-${res.email.toLowerCase()}`, JSON.stringify(updatedUser));
				} catch {}
				setState((prev) => ({
					...prev,
					role: res.role,
					authUserId: res.id,
					users: [updatedUser, ...prev.users.filter((u) => u.id !== res.id && u.email.toLowerCase() !== res.email.toLowerCase())]
				}));
			}
		} catch {}
	}, []);
	useEffect(() => {
		if (!hydrated) return;
		if (typeof localStorage !== "undefined" && Boolean(localStorage.getItem("token"))) {
			syncCurrentUserProfile();
			syncOrdersFromServer();
			syncWishlist();
			syncCartFromServer();
		}
	}, [
		hydrated,
		syncCurrentUserProfile,
		syncOrdersFromServer,
		syncWishlist,
		syncCartFromServer
	]);
	const value = useMemo(() => {
		const { books, users, orders, categories, cart, wishlist, role, authUserId } = state;
		const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
		const hasToken = Boolean(token);
		const storedEmail = (typeof localStorage !== "undefined" ? localStorage.getItem("turath-email") : null) || void 0;
		const effectiveAuthUserId = authUserId || (hasToken ? currentUserId() : null);
		let matchedUser = effectiveAuthUserId ? users.find((u) => u.id === effectiveAuthUserId) ?? users.find((u) => storedEmail && u.email.toLowerCase() === storedEmail.toLowerCase()) : null;
		if (!matchedUser && effectiveAuthUserId && typeof localStorage !== "undefined") try {
			const cached = localStorage.getItem(`turath-profile-${effectiveAuthUserId}`) || (storedEmail ? localStorage.getItem(`turath-profile-${storedEmail.toLowerCase()}`) : null);
			if (cached) matchedUser = JSON.parse(cached);
		} catch {}
		const tokenRole = decodeTokenRole();
		const isAdminEmail = Boolean(storedEmail?.toLowerCase().startsWith("admin@turath.") || matchedUser?.email?.toLowerCase().startsWith("admin@turath."));
		const effectiveUserRole = tokenRole === "admin" || role === "admin" || matchedUser?.role === "admin" || isAdminEmail ? "admin" : tokenRole === "seller" || role === "seller" || matchedUser?.role === "seller" || matchedUser?.sellerState === "approved" ? "seller" : tokenRole ?? role ?? matchedUser?.role ?? "customer";
		const effectiveSellerState = effectiveUserRole === "seller" || matchedUser?.sellerState === "approved" ? "approved" : matchedUser?.sellerState ?? "none";
		const activeUser = effectiveAuthUserId ? {
			...matchedUser ?? {
				id: effectiveAuthUserId,
				name: storedEmail ? storedEmail.split("@")[0] : "Turath Reader",
				email: storedEmail ?? "reader@turath.com",
				status: "active",
				joined: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
			},
			role: effectiveUserRole,
			sellerState: effectiveSellerState
		} : null;
		const bookById = (id) => books.find((b) => b.id === id);
		const updateBooks = (fn) => patch({ books: books.map(fn) });
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
						if (key && (key.startsWith("turath-profile-") || key === "turath-email" || key === "token")) localStorage.removeItem(key);
					}
					const raw = localStorage.getItem(STORAGE_KEY);
					if (raw) {
						const parsed = JSON.parse(raw);
						parsed.authUserId = null;
						parsed.role = "customer";
						parsed.cart = [];
						parsed.wishlist = [];
						localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
					} else localStorage.setItem(STORAGE_KEY, JSON.stringify({
						...defaults,
						authUserId: null,
						role: "customer"
					}));
				} catch {
					localStorage.removeItem(STORAGE_KEY);
				}
				try {
					sessionStorage.clear();
				} catch {}
				patch({
					authUserId: null,
					role: "customer",
					cart: [],
					wishlist: []
				});
				if (typeof window !== "undefined") {
					if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/seller") || window.location.pathname.startsWith("/account")) window.location.href = "/";
				}
			},
			registerUser: (user) => {
				const created = {
					...user,
					id: `u-${Date.now()}`,
					joined: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					status: "active"
				};
				const realRole = decodeTokenRole() ?? user.role ?? "customer";
				const authenticatedId = currentUserId() ?? created.id;
				const authenticatedUser = {
					...created,
					id: authenticatedId,
					role: realRole
				};
				localStorage.setItem("turath-email", user.email);
				try {
					if (!localStorage.getItem("token")) {
						const payload = {
							"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": authenticatedId,
							"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": user.email.toLowerCase(),
							"http://schemas.microsoft.com/ws/2008/06/identity/claims/role": realRole === "admin" ? "Admin" : realRole === "seller" ? "Seller" : "Customer",
							exp: Math.floor(Date.now() / 1e3) + 604800
						};
						const header = btoa(JSON.stringify({
							alg: "HS256",
							typ: "JWT"
						}));
						const body = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
						localStorage.setItem("token", `${header}.${body}.demoSignature`);
					}
					localStorage.setItem(`turath-profile-${user.email.toLowerCase()}`, JSON.stringify(authenticatedUser));
					if (authenticatedId) localStorage.setItem(`turath-profile-${authenticatedId}`, JSON.stringify(authenticatedUser));
				} catch {}
				patch({
					users: [authenticatedUser, ...users.filter((existing) => existing.email.toLowerCase() !== user.email.toLowerCase())],
					authUserId: authenticatedId,
					role: realRole
				});
				syncOrdersFromServer();
				syncWishlist();
				syncCartFromServer();
				return authenticatedUser;
			},
			signIn: (email) => {
				const normalized = email.trim().toLowerCase();
				let user = users.find((u) => u.email.toLowerCase() === normalized);
				if (!user) try {
					const cached = localStorage.getItem(`turath-profile-${normalized}`);
					if (cached) user = JSON.parse(cached);
				} catch {}
				if (user && user.status === "suspended") return false;
				const effectiveRole = decodeTokenRole() ?? (user?.sellerState === "approved" || user?.role === "seller" ? "seller" : user?.role ?? "customer");
				const authenticatedId = currentUserId() ?? user?.id ?? `u-${Date.now()}`;
				localStorage.setItem("turath-email", email.trim());
				try {
					if (!localStorage.getItem("token")) {
						const payload = {
							"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": authenticatedId,
							"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": normalized,
							"http://schemas.microsoft.com/ws/2008/06/identity/claims/role": effectiveRole === "admin" ? "Admin" : effectiveRole === "seller" ? "Seller" : "Customer",
							exp: Math.floor(Date.now() / 1e3) + 604800
						};
						const header = btoa(JSON.stringify({
							alg: "HS256",
							typ: "JWT"
						}));
						const body = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
						localStorage.setItem("token", `${header}.${body}.demoSignature`);
					}
				} catch {}
				const updatedUser = user ? {
					...user,
					id: authenticatedId,
					role: effectiveRole
				} : {
					id: authenticatedId,
					name: email.trim().split("@")[0],
					email: email.trim(),
					role: effectiveRole,
					status: "active",
					joined: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
				};
				try {
					localStorage.setItem(`turath-profile-${normalized}`, JSON.stringify(updatedUser));
					localStorage.setItem(`turath-profile-${authenticatedId}`, JSON.stringify(updatedUser));
				} catch {}
				const updatedUsers = [updatedUser, ...users.filter((existing) => existing.email.toLowerCase() !== normalized && existing.id !== authenticatedId)];
				patch({
					users: updatedUsers,
					authUserId: authenticatedId,
					role: effectiveRole
				});
				syncOrdersFromServer();
				syncWishlist();
				syncCartFromServer();
				return true;
			},
			updateProfile: (userId, profile) => {
				const updatedUsers = users.map((u) => {
					if (u.id === userId || storedEmail && u.email.toLowerCase() === storedEmail.toLowerCase()) {
						const updated = {
							...u,
							...profile
						};
						try {
							if (updated.email) localStorage.setItem(`turath-profile-${updated.email.toLowerCase()}`, JSON.stringify(updated));
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
				if (typeof window !== "undefined") window.location.href = "/";
			},
			visibleBooks: books.filter((b) => !b.removed && (b.approvalStatus === "Approved" || !b.approvalStatus && true) && b.approvalStatus !== "Pending" && b.approvalStatus !== "Rejected"),
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
				const nextWishlist = saved ? wishlist.filter((w) => w !== bookId) : [...wishlist, bookId];
				patch({ wishlist: nextWishlist });
				const userId = currentUserId() || authUserId;
				if (userId) {
					localStorage.setItem(`turath-wishlist-${userId}`, JSON.stringify(nextWishlist));
					const numericId = Number(bookId);
					if (!isNaN(numericId) && numericId > 0) apiFetch(saved ? `/api/Wishlist/remove/${numericId}` : "/api/Wishlist/add", saved ? { method: "DELETE" } : {
						method: "POST",
						body: JSON.stringify({ bookId: numericId })
					}).catch(() => void 0);
				}
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
				const userId = currentUserId() || authUserId;
				if (userId) try {
					let result = null;
					try {
						result = await apiFetch(`/api/Orders`, {
							method: "POST",
							body: JSON.stringify({
								shippingAddress: address,
								items: lines.map((l) => ({
									productId: Number(l.bookId),
									quantity: l.quantity
								}))
							})
						});
					} catch {
						result = await apiFetch(`/api/Cart/checkout`, {
							method: "POST",
							body: JSON.stringify({ customerId: userId })
						});
					}
					const realId = String(result?.id ?? result?.orderId ?? "");
					const realTotal = Number(result?.total ?? result?.totalPrice ?? 0);
					if (realId) {
						const nextOrders = [{
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
						}, ...orders.filter((o) => o.id !== realId)];
						patch({
							orders: nextOrders,
							cart: []
						});
						localStorage.setItem(`turath-orders-${userId}`, JSON.stringify(nextOrders));
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
			setOrderStatus: (orderId, status) => {
				patch({ orders: orders.map((o) => o.id === orderId ? {
					...o,
					status
				} : o) });
				apiFetch(`/api/Orders/${orderId}/status`, {
					method: "PUT",
					body: JSON.stringify({ status })
				}).catch(() => {
					apiFetch(`/api/SellerOrders/${orderId}/status`, {
						method: "PUT",
						body: JSON.stringify({ status })
					}).catch(() => void 0);
				});
			},
			addReview: (bookId, review) => {
				const numId = Number(bookId);
				if (!isNaN(numId) && numId > 0) apiFetch("/api/Reviews/create", {
					method: "POST",
					body: JSON.stringify({
						bookId: numId,
						rating: review.rating,
						comment: review.comment
					})
				}).catch(() => void 0);
				const authorName = resolveUserName(review.author || activeUser?.name, users);
				updateBooks((b) => b.id === bookId ? {
					...b,
					reviews: [{
						...review,
						author: authorName,
						id: `r-${Date.now()}`,
						date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
					}, ...b.reviews]
				} : b);
			},
			editReview: (bookId, reviewId, rating, comment) => {
				const numReviewId = parseInt(reviewId.replace(/\D/g, ""), 10);
				if (!isNaN(numReviewId) && numReviewId > 0) apiFetch(`/api/Reviews/update/${numReviewId}`, {
					method: "PUT",
					body: JSON.stringify({
						rating,
						comment
					})
				}).catch(() => void 0);
				updateBooks((b) => b.id === bookId ? {
					...b,
					reviews: b.reviews.map((r) => r.id === reviewId ? {
						...r,
						rating,
						comment,
						date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
					} : r)
				} : b);
			},
			requestCategory: async (name) => {
				const clean = name.trim();
				if (!clean) return false;
				try {
					await apiFetch("/api/CategoryRequests", {
						method: "POST",
						body: JSON.stringify({ categoryName: clean })
					});
					return true;
				} catch {
					return false;
				}
			},
			saveBook: async (book) => {
				const isNumericId = /^\d+$/.test(book.id);
				const conditionVal = {
					"Like New": 0,
					"Good": 1,
					"Acceptable": 2,
					"Vintage Collector": 1
				}[book.condition] ?? 1;
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
							sellerId: book.sellerId || authUserId
						})
					});
					setState((prev) => ({
						...prev,
						books: prev.books.map((b) => b.id === book.id ? book : b)
					}));
					return book;
				} else {
					const res = await apiFetch("/api/Books", {
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
							sellerId: book.sellerId || authUserId
						})
					});
					const realId = res?.id ? String(res.id) : book.id;
					const savedBook = {
						...book,
						id: realId,
						approvalStatus: "Pending",
						sellerId: res?.sellerId ?? book.sellerId ?? authUserId ?? "",
						category: res?.categoryName ?? book.category
					};
					setState((prev) => ({
						...prev,
						books: [savedBook, ...prev.books.filter((b) => b.id !== book.id && b.id !== realId)]
					}));
					return savedBook;
				}
			},
			deleteBook: (bookId) => {
				if (/^\d+$/.test(bookId)) apiFetch(`/api/Books/${bookId}`, { method: "DELETE" }).catch(() => void 0);
				setState((prev) => ({
					...prev,
					books: prev.books.filter((b) => b.id !== bookId),
					cart: prev.cart.filter((c) => c.bookId !== bookId)
				}));
			},
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
			decideSeller: (userId, decision) => {
				const nextRole = decision === "approved" ? "seller" : "customer";
				const updatedUsers = users.map((u) => {
					if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
						const updated = {
							...u,
							role: nextRole,
							sellerState: decision
						};
						try {
							if (updated.email) localStorage.setItem(`turath-profile-${updated.email.toLowerCase()}`, JSON.stringify(updated));
							localStorage.setItem(`turath-profile-${u.id}`, JSON.stringify(updated));
						} catch {}
						return updated;
					}
					return u;
				});
				patch({
					users: updatedUsers,
					...activeUser && (activeUser.id === userId || activeUser.email.toLowerCase() === userId.toLowerCase()) ? { role: nextRole } : {}
				});
			},
			addCategory: (name) => {
				const clean = name.trim();
				if (!clean || categories.includes(clean)) return;
				apiFetch("/api/Categories", {
					method: "POST",
					body: JSON.stringify({ name: clean })
				}).catch(() => void 0);
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
			removeCategory: (name) => patch({ categories: categories.filter((c) => c !== name) }),
			decideBook: (bookId, decision) => {
				setState((prev) => ({
					...prev,
					books: decision === "Rejected" ? prev.books.filter((b) => b.id !== bookId) : prev.books.map((b) => b.id === bookId ? {
						...b,
						approvalStatus: decision
					} : b)
				}));
			},
			refreshBooks,
			syncOrdersFromServer,
			syncCurrentUserProfile
		};
	}, [
		state,
		hydrated,
		patch,
		refreshBooks,
		syncOrdersFromServer,
		syncCurrentUserProfile
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
	if (Array.isArray(book.reviews) && book.reviews.length > 0) return Math.round(book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length * 10) / 10;
	return Number(book.averageRating ?? 0);
}
var egp = (n) => `${n.toLocaleString("en-EG", { maximumFractionDigits: 2 })} EGP`;
//#endregion
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
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
export { cn as a, USER_FALLBACK_MAP as c, resolveUserName as d, roleLabels as f, currentUserId as h, Button as i, avgRating as l, apiFetch as m, LeafSprig as n, TAX_RATE as o, useTurath as p, Badge as r, TurathProvider as s, BranchDivider as t, egp as u };
