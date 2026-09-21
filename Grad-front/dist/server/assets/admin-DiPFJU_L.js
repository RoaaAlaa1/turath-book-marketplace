import { c as USER_FALLBACK_MAP, i as Button, m as apiFetch, p as useTurath, r as Badge, t as BranchDivider, u as egp } from "./Ornaments-JhP4ydzQ.js";
import { n as Input, t as Label } from "./label-Qb1MoFXK.js";
import { t as BookCover } from "./BookCover-0ywG3LRk.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DwJylPgh.js";
import { n as statusTone } from "./orders-CtTX1Wsa.js";
import { a as DialogHeader, c as Textarea, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-BnIQQ4q4.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DgUvlRm6.js";
import { useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Check, ChevronDown, ChevronRight, Eye, Flag, MessageSquare, Pencil, Plus, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/admin.tsx?tsr-split=component
function AdminPortal() {
	const { role, activeUser, isAuthenticated, users, books, orders, categories, setUserStatus, decideSeller, toggleFlag, toggleRemoved, addCategory, renameCategory, removeCategory, setOrderStatus, decideBook, syncOrdersFromServer } = useTurath();
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [newCategory, setNewCategory] = useState("");
	const [editingCategory, setEditingCategory] = useState(null);
	const [categoryDraft, setCategoryDraft] = useState("");
	const [sellerRequests, setSellerRequests] = useState([]);
	const [categoryRequests, setCategoryRequests] = useState([]);
	const [supportTickets, setSupportTickets] = useState([]);
	const [replyTicket, setReplyTicket] = useState(null);
	const [adminResponseText, setAdminResponseText] = useState("");
	const [adminUsers, setAdminUsers] = useState([]);
	const [adminPendingBooks, setAdminPendingBooks] = useState([]);
	const [adminAllBooks, setAdminAllBooks] = useState([]);
	const mapAdminBook = (b) => ({
		id: String(b.id),
		title: b.title ?? "Untitled",
		titleAr: b.titleAr,
		author: b.author ?? "Unknown",
		price: Number(b.price ?? 0),
		availableQuantity: Number(b.quantity ?? b.availableQuantity ?? 0),
		category: b.categoryName ?? b.category ?? "General",
		condition: b.condition ?? "Good",
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
		approvalStatus: b.approvalStatus ?? "Pending"
	});
	const [bookCategoryFilter, setBookCategoryFilter] = useState("ALL");
	const [bookSearch, setBookSearch] = useState("");
	const [bookViewMode, setBookViewMode] = useState("accordion");
	const [expandedCategories, setExpandedCategories] = useState({});
	const isAdmin = role === "admin" || activeUser?.role === "admin" || Boolean(activeUser?.email?.toLowerCase().startsWith("admin@turath.")) || typeof localStorage !== "undefined" && (localStorage.getItem("turath-email")?.toLowerCase().startsWith("admin@turath.") ?? false);
	const loadData = () => {
		syncOrdersFromServer();
		apiFetch("/api/SellerRequests?status=Pending").then((reqs) => setSellerRequests(reqs)).catch(() => setSellerRequests([]));
		apiFetch("/api/Admin/category-requests").then((reqs) => setCategoryRequests(reqs)).catch(() => setCategoryRequests([]));
		apiFetch("/api/admin/support-tickets").then((tickets) => setSupportTickets(tickets)).catch(() => setSupportTickets([]));
		apiFetch("/api/Admin/users").then((u) => setAdminUsers(u)).catch(() => setAdminUsers([]));
		apiFetch("/api/Admin/books/pending").then((data) => setAdminPendingBooks(Array.isArray(data) ? data.map(mapAdminBook) : [])).catch(() => setAdminPendingBooks([]));
		apiFetch("/api/Admin/books").then((data) => setAdminAllBooks(Array.isArray(data) ? data.map(mapAdminBook) : [])).catch(() => setAdminAllBooks([]));
	};
	useEffect(() => {
		if (isAdmin) loadData();
	}, [isAdmin]);
	if (!isAdmin) return /* @__PURE__ */ jsx("div", {
		className: "mx-auto max-w-lg px-4 py-24 text-center",
		children: /* @__PURE__ */ jsxs("div", {
			className: "rounded-xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm",
			children: [
				/* @__PURE__ */ jsx(ShieldAlert, { className: "mx-auto h-12 w-12 text-destructive" }),
				/* @__PURE__ */ jsx("h1", {
					className: "font-display mt-4 text-2xl tracking-wide text-destructive",
					children: "403 Access Denied"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "font-arabic-display mt-2 text-xl text-primary",
					children: "غير مصرح بالدخول"
				}),
				/* @__PURE__ */ jsx(BranchDivider, { className: "my-6" }),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm leading-relaxed text-muted-foreground",
					children: "You do not have administrative privileges to view the Keeper’s Stewardship Desk. This area is reserved exclusively for platform administrators."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Button, {
						onClick: () => {
							window.location.href = "/";
						},
						children: "Return to Home"
					})
				})
			]
		})
	});
	const handleAdminOrderStatusChange = async (orderId, newStatus) => {
		setOrderStatus(orderId, newStatus);
		if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder((prev) => prev ? {
			...prev,
			status: newStatus
		} : null);
		try {
			await apiFetch(`/api/Orders/${orderId}/status`, {
				method: "PUT",
				body: JSON.stringify({ status: newStatus })
			});
			toast.success(`Order ${orderId} updated to ${newStatus}`);
			syncOrdersFromServer();
		} catch {
			toast.error("Failed to update status on server.");
		}
	};
	const decideServerSellerRequest = async (request, decision) => {
		try {
			await apiFetch(`/api/SellerRequests/${request.id}/${decision}`, { method: "POST" });
			setSellerRequests((requests) => requests.filter((item) => item.id !== request.id));
			const stateDecision = decision === "approve" ? "approved" : "rejected";
			decideSeller(request.userId, stateDecision);
			if (request.userEmail && request.userEmail !== request.userId) decideSeller(request.userEmail, stateDecision);
			toast.success(`${request.userEmail} ${decision}d`);
			loadData();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to process seller request.");
		}
	};
	const decideCategoryRequest = async (id, decision, catName) => {
		try {
			await apiFetch(`/api/Admin/category-requests/${id}/${decision}`, { method: "POST" });
			setCategoryRequests((prev) => prev.filter((r) => r.id !== id));
			if (decision === "approve") {
				addCategory(catName);
				toast.success(`Category "${catName}" approved and added.`);
			} else toast.success(`Category request "${catName}" rejected.`);
		} catch (error) {
			toast.error("Failed to process category request.");
		}
	};
	const decideBookApproval = async (bookId, decision) => {
		const nextStatus = decision === "approve" ? "Approved" : "Rejected";
		try {
			const numId = parseInt(bookId.replace(/\D/g, ""), 10);
			if (!isNaN(numId) && numId > 0) await apiFetch(`/api/Admin/books/${numId}/${decision}`, { method: "POST" });
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
					status: 2,
					adminResponse: adminResponseText.trim()
				})
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
	const pendingBooks = adminPendingBooks.length > 0 ? adminPendingBooks : books.filter((b) => b.approvalStatus === "Pending");
	orders.filter((o) => o.status === "Pending");
	catalogBooks.filter((b) => b.flagged || b.removed);
	const getSellerName = (sellerId, directName) => {
		if (directName && directName !== "Unknown Seller") return directName;
		const user = displayUsers.find((u) => u.id === sellerId || u.email === sellerId);
		if (user?.name) return user.name;
		if (USER_FALLBACK_MAP[sellerId]) return USER_FALLBACK_MAP[sellerId];
		return "Verified Seller";
	};
	const filteredBooks = useMemo(() => {
		return catalogBooks.filter((b) => {
			const matchCat = bookCategoryFilter === "ALL" || b.category === bookCategoryFilter;
			const matchSearch = !bookSearch.trim() || b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.author.toLowerCase().includes(bookSearch.toLowerCase()) || getSellerName(b.sellerId, b.sellerName).toLowerCase().includes(bookSearch.toLowerCase());
			return matchCat && matchSearch;
		});
	}, [
		catalogBooks,
		bookCategoryFilter,
		bookSearch,
		displayUsers
	]);
	const booksByCategory = useMemo(() => {
		const map = {};
		for (const b of filteredBooks) {
			const cat = b.category || "General";
			if (!map[cat]) map[cat] = [];
			map[cat].push(b);
		}
		return map;
	}, [filteredBooks]);
	const toggleCategoryAccordion = (cat) => {
		setExpandedCategories((prev) => ({
			...prev,
			[cat]: !prev[cat]
		}));
	};
	const metrics = [
		["Customers", customers.length],
		["Sellers", sellers.length],
		["Products", activeBooks.length],
		["Orders", orders.length],
		["Support Tickets", supportTickets.length]
	];
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
	const saveCategory = (oldName) => {
		const clean = categoryDraft.trim();
		if (!clean || clean !== oldName && categories.includes(clean)) {
			toast.error("Enter a unique category name");
			return;
		}
		renameCategory(oldName, clean);
		setEditingCategory(null);
		toast.success("Category renamed");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-7xl px-4 py-10",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "text-center",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs tracking-[0.35em] text-muted-foreground uppercase",
						children: "Turath Stewardship"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "font-display mt-2 text-3xl tracking-wide",
						children: "The Keeper’s Desk"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-arabic-display mt-1 text-xl text-primary",
						children: "لوحة المشرف"
					}),
					/* @__PURE__ */ jsx(BranchDivider, { className: "mt-4" })
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
				children: metrics.map(([label, value]) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border bg-card p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs tracking-wide text-muted-foreground uppercase",
						children: label
					}), /* @__PURE__ */ jsx("p", {
						className: "font-display mt-1 text-2xl",
						children: value
					})]
				}, label))
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "Seller Approval Desk",
					count: sellerRequests.length || pendingSellers.length
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Applicant" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Joined" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Decision"
						})
					] }) }), /* @__PURE__ */ jsxs(TableBody, { children: [
						sellerRequests.map((request) => /* @__PURE__ */ jsxs(TableRow, { children: [
							/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: request.userName || getSellerName(request.userId)
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: request.userEmail
							})] }),
							/* @__PURE__ */ jsx(TableCell, { children: new Date(request.requestedAt).toLocaleDateString() }),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
								className: "bg-amber-gold/25 text-foreground",
								children: "Pending review"
							}) }),
							/* @__PURE__ */ jsxs(TableCell, {
								className: "text-right",
								children: [/* @__PURE__ */ jsxs(Button, {
									size: "sm",
									onClick: () => void decideServerSellerRequest(request, "approve"),
									children: [/* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }), " Approve"]
								}), /* @__PURE__ */ jsxs(Button, {
									size: "sm",
									variant: "ghost",
									className: "ml-1 text-destructive",
									onClick: () => void decideServerSellerRequest(request, "reject"),
									children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), " Reject"]
								})]
							})
						] }, request.id)),
						!sellerRequests.length && pendingSellers.map((user) => /* @__PURE__ */ jsxs(TableRow, { children: [
							/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: user.name
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: user.email
							})] }),
							/* @__PURE__ */ jsx(TableCell, { children: user.joined }),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
								className: "bg-amber-gold/25 text-foreground",
								children: "Pending review"
							}) }),
							/* @__PURE__ */ jsxs(TableCell, {
								className: "text-right",
								children: [/* @__PURE__ */ jsxs(Button, {
									size: "sm",
									onClick: () => {
										decideSeller(user.id, "approved");
										toast.success(`${user.name} approved`);
									},
									children: [/* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }), " Approve"]
								}), /* @__PURE__ */ jsxs(Button, {
									size: "sm",
									variant: "ghost",
									className: "ml-1 text-destructive",
									onClick: () => {
										decideSeller(user.id, "rejected");
										toast.success(`${user.name} rejected`);
									},
									children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), " Reject"]
								})]
							})
						] }, user.id)),
						!sellerRequests.length && !pendingSellers.length && /* @__PURE__ */ jsx(EmptyRow, {
							colSpan: 4,
							text: "No seller applications waiting."
						})
					] })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "Pending Book Approvals",
					count: pendingBooks.length
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Book" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Seller" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Price" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Decision"
						})
					] }) }), /* @__PURE__ */ jsxs(TableBody, { children: [pendingBooks.map((b) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [b.imageUrl ? /* @__PURE__ */ jsx("img", {
								src: b.imageUrl,
								alt: b.title,
								className: "h-12 w-9 rounded object-cover shadow-sm shrink-0",
								onError: (e) => {
									e.target.style.display = "none";
								}
							}) : /* @__PURE__ */ jsx(BookCover, {
								book: b,
								className: "h-12 w-9 shrink-0"
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: b.title
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: b.author
							})] })]
						}) }),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("p", {
							className: "font-medium",
							children: getSellerName(b.sellerId, b.sellerName)
						}) }),
						/* @__PURE__ */ jsx(TableCell, { children: b.category }),
						/* @__PURE__ */ jsx(TableCell, { children: egp(b.price) }),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "text-right",
							children: [/* @__PURE__ */ jsxs(Button, {
								size: "sm",
								onClick: () => void decideBookApproval(b.id, "approve"),
								children: [/* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }), " Approve"]
							}), /* @__PURE__ */ jsxs(Button, {
								size: "sm",
								variant: "ghost",
								className: "ml-1 text-destructive",
								onClick: () => void decideBookApproval(b.id, "reject"),
								children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), " Reject"]
							})]
						})
					] }, b.id)), !pendingBooks.length && /* @__PURE__ */ jsx(EmptyRow, {
						colSpan: 5,
						text: "No books are pending approval."
					})] })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "Category Requests from Sellers",
					count: categoryRequests.length
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Suggested Category" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Requested By (Seller)" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Requested At" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] }) }), /* @__PURE__ */ jsxs(TableBody, { children: [categoryRequests.map((req) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "font-semibold text-primary",
							children: req.categoryName
						}),
						/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("p", {
							className: "font-medium",
							children: getSellerName(req.sellerId, req.sellerName)
						}), req.sellerEmail ? /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: req.sellerEmail
						}) : /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: "Verified Seller"
						})] }),
						/* @__PURE__ */ jsx(TableCell, { children: new Date(req.requestedAt).toLocaleDateString() }),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "text-right",
							children: [/* @__PURE__ */ jsxs(Button, {
								size: "sm",
								onClick: () => void decideCategoryRequest(req.id, "approve", req.categoryName),
								children: [/* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }), " Approve & Add"]
							}), /* @__PURE__ */ jsxs(Button, {
								size: "sm",
								variant: "ghost",
								className: "ml-1 text-destructive",
								onClick: () => void decideCategoryRequest(req.id, "reject", req.categoryName),
								children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), " Reject"]
							})]
						})
					] }, req.id)), !categoryRequests.length && /* @__PURE__ */ jsx(EmptyRow, {
						colSpan: 4,
						text: "No pending category requests."
					})] })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx(SectionHeading, {
						title: "Catalog & Product Moderation",
						count: filteredBooks.length
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "relative w-48",
								children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
									placeholder: "Search title/author...",
									value: bookSearch,
									onChange: (e) => setBookSearch(e.target.value),
									className: "pl-8 h-9 text-xs"
								})]
							}),
							/* @__PURE__ */ jsxs(Select, {
								value: bookCategoryFilter,
								onValueChange: setBookCategoryFilter,
								children: [/* @__PURE__ */ jsx(SelectTrigger, {
									className: "w-44 h-9 text-xs",
									children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All Categories" })
								}), /* @__PURE__ */ jsxs(SelectContent, { children: [/* @__PURE__ */ jsxs(SelectItem, {
									value: "ALL",
									children: [
										"All Categories (",
										books.length,
										")"
									]
								}), categories.map((c) => /* @__PURE__ */ jsxs(SelectItem, {
									value: c,
									children: [
										c,
										" (",
										books.filter((b) => b.category === c).length,
										")"
									]
								}, c))] })]
							}),
							/* @__PURE__ */ jsx(Button, {
								variant: "outline",
								size: "sm",
								className: "h-9 text-xs",
								onClick: () => setBookViewMode(bookViewMode === "accordion" ? "table" : "accordion"),
								children: bookViewMode === "accordion" ? "Switch to Flat Table" : "Switch to Grouped Dropdown"
							})
						]
					})]
				}), bookViewMode === "accordion" ? /* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [Object.entries(booksByCategory).map(([cat, catBooks]) => {
						const isOpen = expandedCategories[cat] ?? true;
						return /* @__PURE__ */ jsxs("div", {
							className: "rounded-lg border bg-card overflow-hidden",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => toggleCategoryAccordion(cat),
								className: "flex w-full items-center justify-between p-4 text-left font-medium transition hover:bg-muted/50",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										isOpen ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }),
										/* @__PURE__ */ jsx("span", {
											className: "font-serif text-base",
											children: cat
										}),
										/* @__PURE__ */ jsxs(Badge, {
											variant: "secondary",
											className: "text-xs",
											children: [catBooks.length, " books"]
										})
									]
								})
							}), isOpen && /* @__PURE__ */ jsx("div", {
								className: "border-t",
								children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
									/* @__PURE__ */ jsx(TableHead, { children: "Listing" }),
									/* @__PURE__ */ jsx(TableHead, { children: "Seller" }),
									/* @__PURE__ */ jsx(TableHead, { children: "Condition" }),
									/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
									/* @__PURE__ */ jsx(TableHead, {
										className: "text-right",
										children: "Actions"
									})
								] }) }), /* @__PURE__ */ jsx(TableBody, { children: catBooks.map((book) => /* @__PURE__ */ jsxs(TableRow, { children: [
									/* @__PURE__ */ jsxs(TableCell, {
										className: "font-medium",
										children: [book.title, /* @__PURE__ */ jsxs("p", {
											className: "text-xs font-normal text-muted-foreground",
											children: [
												egp(book.price),
												" · ",
												book.author
											]
										})]
									}),
									/* @__PURE__ */ jsx(TableCell, { children: getSellerName(book.sellerId, book.sellerName) }),
									/* @__PURE__ */ jsx(TableCell, {
										className: "text-xs",
										children: book.condition
									}),
									/* @__PURE__ */ jsx(TableCell, { children: book.removed ? /* @__PURE__ */ jsx(Badge, {
										className: "bg-destructive/15 text-destructive",
										children: "Removed"
									}) : book.flagged ? /* @__PURE__ */ jsx(Badge, {
										className: "bg-amber-gold/25 text-foreground",
										children: "Flagged"
									}) : /* @__PURE__ */ jsx(Badge, {
										className: "bg-sage/25 text-primary",
										children: "Live"
									}) }),
									/* @__PURE__ */ jsxs(TableCell, {
										className: "text-right",
										children: [/* @__PURE__ */ jsx(Button, {
											size: "icon",
											variant: "ghost",
											"aria-label": book.flagged ? "Clear flag" : "Flag listing",
											onClick: () => {
												toggleFlag(book.id);
												toast.success(book.flagged ? "Flag cleared" : "Listing flagged");
											},
											children: /* @__PURE__ */ jsx(Flag, { className: "h-4 w-4" })
										}), /* @__PURE__ */ jsx(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => {
												toggleRemoved(book.id);
												toast.success(book.removed ? "Listing restored" : "Listing removed");
											},
											children: book.removed ? "Restore" : "Remove"
										})]
									})
								] }, book.id)) })] })
							})]
						}, cat);
					}), Object.keys(booksByCategory).length === 0 && /* @__PURE__ */ jsx("div", {
						className: "rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground",
						children: "No books found matching the current filter."
					})]
				}) : /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Listing" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Seller" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: filteredBooks.map((book) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsxs(TableCell, {
							className: "font-medium",
							children: [book.title, /* @__PURE__ */ jsxs("p", {
								className: "text-xs font-normal text-muted-foreground",
								children: [
									egp(book.price),
									" · ",
									book.author
								]
							})]
						}),
						/* @__PURE__ */ jsx(TableCell, { children: getSellerName(book.sellerId, book.sellerName) }),
						/* @__PURE__ */ jsx(TableCell, { children: book.category }),
						/* @__PURE__ */ jsx(TableCell, { children: book.removed ? /* @__PURE__ */ jsx(Badge, {
							className: "bg-destructive/15 text-destructive",
							children: "Removed"
						}) : book.flagged ? /* @__PURE__ */ jsx(Badge, {
							className: "bg-amber-gold/25 text-foreground",
							children: "Flagged"
						}) : /* @__PURE__ */ jsx(Badge, {
							className: "bg-sage/25 text-primary",
							children: "Live"
						}) }),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "text-right",
							children: [/* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: "ghost",
								"aria-label": book.flagged ? "Clear flag" : "Flag listing",
								onClick: () => {
									toggleFlag(book.id);
									toast.success(book.flagged ? "Flag cleared" : "Listing flagged");
								},
								children: /* @__PURE__ */ jsx(Flag, { className: "h-4 w-4" })
							}), /* @__PURE__ */ jsx(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => {
									toggleRemoved(book.id);
									toast.success(book.removed ? "Listing restored" : "Listing removed");
								},
								children: book.removed ? "Restore" : "Remove"
							})]
						})
					] }, book.id)) })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "Customer Support Tickets",
					count: supportTickets.length
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Ticket #" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Subject" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Created" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Response"
						})
					] }) }), /* @__PURE__ */ jsxs(TableBody, { children: [supportTickets.map((ticket) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsxs(TableCell, {
							className: "font-semibold",
							children: ["#", ticket.id]
						}),
						/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("p", {
							className: "font-medium",
							children: ticket.subject
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground line-clamp-1",
							children: ticket.message
						})] }),
						/* @__PURE__ */ jsx(TableCell, { children: ticket.customerEmail || "Reader" }),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
							variant: ticket.adminResponse ? "secondary" : "outline",
							className: ticket.adminResponse ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
							children: ticket.adminResponse ? "Resolved" : "Pending"
						}) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-xs text-muted-foreground",
							children: new Date(ticket.createdAt).toLocaleDateString()
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ jsxs(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => {
									setReplyTicket(ticket);
									setAdminResponseText(ticket.adminResponse || "");
								},
								children: [
									/* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5 mr-1" }),
									" ",
									ticket.adminResponse ? "View / Edit" : "Reply"
								]
							})
						})
					] }, ticket.id)), !supportTickets.length && /* @__PURE__ */ jsx(EmptyRow, {
						colSpan: 6,
						text: "No customer support tickets submitted yet."
					})] })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "User Control",
					count: displayUsers.length
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "User" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Role" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Joined" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Access"
						})
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: displayUsers.map((user) => {
						const isSuspended = user.isSuspended || user.status === "suspended";
						const userRole = user.role || "customer";
						const roleDisplay = userRole === "seller" ? "Seller" : userRole === "admin" ? "Admin" : "Customer";
						return /* @__PURE__ */ jsxs(TableRow, { children: [
							/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: user.name || user.userName || user.email
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: user.email
							})] }),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
								variant: userRole === "seller" ? "default" : "outline",
								className: userRole === "seller" ? "bg-primary text-primary-foreground" : "",
								children: roleDisplay
							}) }),
							/* @__PURE__ */ jsx(TableCell, { children: user.joined || "Recent" }),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
								className: !isSuspended ? "bg-sage/25 text-primary" : "bg-destructive/15 text-destructive",
								children: !isSuspended ? "active" : "suspended"
							}) }),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ jsx(Button, {
									size: "sm",
									variant: "outline",
									onClick: async () => {
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
									},
									children: !isSuspended ? "Suspend" : "Activate"
								})
							})
						] }, user.id);
					}) })] })
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr]",
				children: [/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "Categories",
					count: categories.length
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border bg-card p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "new-category",
								className: "sr-only",
								children: "New category"
							}),
							/* @__PURE__ */ jsx(Input, {
								id: "new-category",
								value: newCategory,
								onChange: (e) => setNewCategory(e.target.value),
								placeholder: "New category",
								onKeyDown: (e) => e.key === "Enter" && addNewCategory()
							}),
							/* @__PURE__ */ jsx(Button, {
								size: "icon",
								"aria-label": "Add category",
								onClick: addNewCategory,
								children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
							})
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-4 space-y-2",
						children: categories.map((category) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 border-b pb-2 last:border-0 last:pb-0",
							children: [
								editingCategory === category ? /* @__PURE__ */ jsx(Input, {
									value: categoryDraft,
									onChange: (e) => setCategoryDraft(e.target.value),
									autoFocus: true
								}) : /* @__PURE__ */ jsx("span", {
									className: "flex-1 text-sm",
									children: category
								}),
								editingCategory === category ? /* @__PURE__ */ jsx(Button, {
									size: "icon",
									variant: "ghost",
									"aria-label": "Save category",
									onClick: () => saveCategory(category),
									children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
								}) : /* @__PURE__ */ jsx(Button, {
									size: "icon",
									variant: "ghost",
									"aria-label": `Rename ${category}`,
									onClick: () => {
										setEditingCategory(category);
										setCategoryDraft(category);
									},
									children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ jsx(Button, {
									size: "icon",
									variant: "ghost",
									"aria-label": `Remove ${category}`,
									className: "text-destructive",
									onClick: () => {
										removeCategory(category);
										toast.success("Category removed");
									},
									children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
								})
							]
						}, category))
					})]
				})] }), /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "Master Order Overview",
					count: orders.length
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Order" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Total" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "View"
						})
					] }) }), /* @__PURE__ */ jsxs(TableBody, { children: [orders.map((order) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsxs(TableCell, {
							className: "font-medium",
							children: [order.id, /* @__PURE__ */ jsx("p", {
								className: "text-xs font-normal text-muted-foreground",
								children: order.placedAt
							})]
						}),
						/* @__PURE__ */ jsx(TableCell, { children: order.customerName }),
						/* @__PURE__ */ jsx(TableCell, { children: egp(order.total) }),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Select, {
							value: order.status,
							onValueChange: (val) => handleAdminOrderStatusChange(order.id, val),
							children: [/* @__PURE__ */ jsx(SelectTrigger, {
								className: "h-8 w-[130px]",
								children: /* @__PURE__ */ jsx(SelectValue, { children: /* @__PURE__ */ jsx(Badge, {
									className: statusTone[order.status],
									children: order.status
								}) })
							}), /* @__PURE__ */ jsxs(SelectContent, { children: [
								/* @__PURE__ */ jsx(SelectItem, {
									value: "Pending",
									children: "Pending"
								}),
								/* @__PURE__ */ jsx(SelectItem, {
									value: "Confirmed",
									children: "Confirmed"
								}),
								/* @__PURE__ */ jsx(SelectItem, {
									value: "Shipped",
									children: "Shipped"
								}),
								/* @__PURE__ */ jsx(SelectItem, {
									value: "Delivered",
									children: "Delivered"
								}),
								/* @__PURE__ */ jsx(SelectItem, {
									value: "Cancelled",
									children: "Cancelled"
								})
							] })]
						}) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: "ghost",
								"aria-label": `View ${order.id}`,
								onClick: () => setSelectedOrder(order),
								children: /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
							})
						})
					] }, order.id)), !orders.length && /* @__PURE__ */ jsx(EmptyRow, {
						colSpan: 5,
						text: "No orders have been placed."
					})] })] })
				})] })]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: !!replyTicket,
				onOpenChange: (open) => !open && setReplyTicket(null),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "sm:max-w-lg",
					children: [
						/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: ["Support Ticket #", replyTicket?.id] }) }),
						replyTicket && /* @__PURE__ */ jsxs("div", {
							className: "space-y-4 py-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "rounded-md bg-muted p-3",
								children: [
									/* @__PURE__ */ jsxs("p", {
										className: "text-xs font-semibold uppercase text-muted-foreground",
										children: ["Subject: ", replyTicket.subject]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-sm",
										children: replyTicket.message
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-2 text-xs text-muted-foreground",
										children: ["From: ", replyTicket.customerEmail || "Reader"]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "admin-reply",
									children: "Steward Response"
								}), /* @__PURE__ */ jsx(Textarea, {
									id: "admin-reply",
									rows: 4,
									value: adminResponseText,
									onChange: (e) => setAdminResponseText(e.target.value),
									placeholder: "Type your response to the customer..."
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
							variant: "outline",
							onClick: () => setReplyTicket(null),
							children: "Cancel"
						}), /* @__PURE__ */ jsx(Button, {
							onClick: handleReplyTicket,
							disabled: !adminResponseText.trim(),
							children: "Send Response"
						})] })
					]
				})
			}),
			/* @__PURE__ */ jsx(OrderDialog, {
				order: selectedOrder,
				onClose: () => setSelectedOrder(null),
				onStatusChange: handleAdminOrderStatusChange
			})
		]
	});
}
function SectionHeading({ title, count }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-3 flex items-center gap-2",
		children: [/* @__PURE__ */ jsx("h2", {
			className: "font-display text-xl tracking-wide",
			children: title
		}), /* @__PURE__ */ jsx(Badge, {
			variant: "outline",
			children: count
		})]
	});
}
function EmptyRow({ colSpan, text }) {
	return /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
		colSpan,
		className: "py-8 text-center text-sm text-muted-foreground",
		children: text
	}) });
}
function OrderDialog({ order, onClose, onStatusChange }) {
	return /* @__PURE__ */ jsx(Dialog, {
		open: !!order,
		onOpenChange: (open) => !open && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, { children: [/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, {
			className: "font-display tracking-wide",
			children: ["Order ", order?.id]
		}) }), order && /* @__PURE__ */ jsxs("div", {
			className: "space-y-4 text-sm",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-medium",
						children: order.customerName
					}), /* @__PURE__ */ jsxs(Select, {
						value: order.status,
						onValueChange: (val) => onStatusChange(order.id, val),
						children: [/* @__PURE__ */ jsx(SelectTrigger, {
							className: "h-8 w-[130px]",
							children: /* @__PURE__ */ jsx(SelectValue, { children: /* @__PURE__ */ jsx(Badge, {
								className: statusTone[order.status],
								children: order.status
							}) })
						}), /* @__PURE__ */ jsxs(SelectContent, { children: [
							/* @__PURE__ */ jsx(SelectItem, {
								value: "Pending",
								children: "Pending"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "Confirmed",
								children: "Confirmed"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "Shipped",
								children: "Shipped"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "Delivered",
								children: "Delivered"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "Cancelled",
								children: "Cancelled"
							})
						] })]
					})]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-muted-foreground",
					children: ["Ships to ", order.address]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "space-y-2 border-y py-4",
					children: order.lines.map((line) => /* @__PURE__ */ jsxs("div", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							line.title,
							" × ",
							line.quantity
						] }), /* @__PURE__ */ jsx("span", { children: egp(line.price * line.quantity) })]
					}, line.bookId))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between font-semibold",
					children: [/* @__PURE__ */ jsx("span", { children: "Total" }), /* @__PURE__ */ jsx("span", { children: egp(order.total) })]
				})
			]
		})] })
	});
}
//#endregion
export { AdminPortal as component };
