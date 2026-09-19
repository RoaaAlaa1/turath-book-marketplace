import { c as egp, d as apiFetch, l as roleLabels, r as Badge, t as BranchDivider, u as useTurath } from "./Ornaments-Coe9p7fj.js";
import { t as Button } from "./button-wmx3H39q.js";
import { n as Input, t as Label } from "./label-BjU0brKD.js";
import { n as statusTone } from "./orders-B-Him931.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, t as Dialog } from "./dialog-BSVgTLGj.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DTLhZx7U.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Check, Eye, Flag, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/admin.tsx?tsr-split=component
function AdminPortal() {
	const { users, books, orders, categories, setUserStatus, decideSeller, toggleFlag, toggleRemoved, addCategory, renameCategory, removeCategory } = useTurath();
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [newCategory, setNewCategory] = useState("");
	const [editingCategory, setEditingCategory] = useState(null);
	const [categoryDraft, setCategoryDraft] = useState("");
	const [sellerRequests, setSellerRequests] = useState([]);
	const customers = users.filter((u) => u.role === "customer");
	const sellers = users.filter((u) => u.role === "seller");
	const pendingSellers = users.filter((u) => u.sellerState === "pending");
	const activeBooks = books.filter((b) => !b.removed);
	const pendingOrders = orders.filter((o) => o.status === "Pending");
	const flaggedBooks = books.filter((b) => b.flagged || b.removed);
	const sellerName = (id) => users.find((u) => u.id === id)?.name ?? "Unknown seller";
	useEffect(() => {
		apiFetch("/api/SellerRequests?status=Pending").then((requests) => setSellerRequests(requests)).catch(() => setSellerRequests([]));
	}, []);
	const decideServerSellerRequest = async (request, decision) => {
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
		["Pending queue", pendingOrders.length]
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
					title: "Seller approval desk",
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
								children: request.userEmail
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: request.userId
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
							text: "No seller applications are waiting."
						})
					] })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "User control",
					count: users.length
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
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: users.map((user) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("p", {
							className: "font-medium",
							children: user.name
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: user.email
						})] }),
						/* @__PURE__ */ jsx(TableCell, { children: roleLabels[user.role].en }),
						/* @__PURE__ */ jsx(TableCell, { children: user.joined }),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
							className: user.status === "active" ? "bg-sage/25 text-primary" : "bg-destructive/15 text-destructive",
							children: user.status
						}) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ jsx(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => {
									const next = user.status === "active" ? "suspended" : "active";
									setUserStatus(user.id, next);
									toast.success(`${user.name} ${next}`);
								},
								children: user.status === "active" ? "Suspend" : "Activate"
							})
						})
					] }, user.id)) })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx(SectionHeading, {
					title: "Product moderation",
					count: flaggedBooks.length
				}), /* @__PURE__ */ jsx("div", {
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
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: books.map((book) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsxs(TableCell, {
							className: "font-medium",
							children: [book.title, /* @__PURE__ */ jsx("p", {
								className: "text-xs font-normal text-muted-foreground",
								children: egp(book.price)
							})]
						}),
						/* @__PURE__ */ jsx(TableCell, { children: sellerName(book.sellerId) }),
						/* @__PURE__ */ jsx(TableCell, { children: book.category }),
						/* @__PURE__ */ jsx(TableCell, { children: book.removed ? /* @__PURE__ */ jsx(Badge, {
							className: "bg-destructive/15 text-destructive",
							children: "Removed"
						}) : book.flagged ? /* @__PURE__ */ jsx(Badge, {
							className: "bg-amber-gold/25 text-foreground",
							children: "Flagged"
						}) : /* @__PURE__ */ jsx(Badge, {
							className: "bg-sage/25 text-primary",
							children: "Clear"
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
					title: "Master order overview",
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
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, {
							className: statusTone[order.status],
							children: order.status
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
			/* @__PURE__ */ jsx(OrderDialog, {
				order: selectedOrder,
				onClose: () => setSelectedOrder(null)
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
function OrderDialog({ order, onClose }) {
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
					className: "flex flex-wrap justify-between gap-2",
					children: [/* @__PURE__ */ jsx("span", { children: order.customerName }), /* @__PURE__ */ jsx(Badge, {
						className: statusTone[order.status],
						children: order.status
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
