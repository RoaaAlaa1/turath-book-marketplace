import { c as egp, r as Badge, t as BranchDivider, u as useTurath } from "./Ornaments-BLU82UQZ.js";
import { t as Button } from "./button-BixuqtKh.js";
import { n as Input, t as Label } from "./label-B5CEMjCo.js";
import { t as BookCover } from "./BookCover-0ywG3LRk.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-D42fHuRt.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CS3HFS5X.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DcOkl2XL.js";
import { t as Textarea } from "./textarea-CorrVEk_.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Hourglass, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/seller.tsx?tsr-split=component
var conditions = [
	"Acceptable",
	"Good",
	"Like New",
	"Vintage Collector"
];
var statuses = [
	"Pending",
	"Confirmed",
	"Shipped",
	"Delivered",
	"Cancelled"
];
var spines = [
	"rust",
	"navy",
	"amber",
	"sage",
	"crimson"
];
function SellerPortal() {
	const { role, activeUser, books, orders, categories, saveBook, deleteBook, setOrderStatus } = useTurath();
	const [editing, setEditing] = useState(null);
	const myBooks = useMemo(() => books.filter((b) => b.sellerId === activeUser.id), [books, activeUser.id]);
	const myOrders = useMemo(() => orders.filter((o) => o.lines.some((l) => l.sellerId === activeUser.id)), [orders, activeUser.id]);
	const revenue = myOrders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.lines.filter((l) => l.sellerId === activeUser.id).reduce((n, l) => n + l.price * l.quantity, 0), 0);
	if (role === "pendingSeller") return /* @__PURE__ */ jsx("div", {
		className: "mx-auto max-w-2xl px-4 py-24 text-center",
		children: /* @__PURE__ */ jsxs("div", {
			className: "rounded-lg border border-amber-gold/50 bg-amber-gold/10 p-10",
			children: [
				/* @__PURE__ */ jsx(Hourglass, { className: "mx-auto h-10 w-10 text-amber-gold" }),
				/* @__PURE__ */ jsx("h1", {
					className: "font-display mt-4 text-2xl tracking-wide",
					children: "Verification in progress"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "font-arabic-display mt-2 text-xl text-primary",
					children: "حسابك قيد المراجعة"
				}),
				/* @__PURE__ */ jsx(BranchDivider, { className: "my-6" }),
				/* @__PURE__ */ jsxs("p", {
					className: "text-sm leading-relaxed text-muted-foreground",
					children: [
						"Thank you, ",
						activeUser.name,
						". A steward is reviewing your shop application. Listing books, editing inventory and fulfilling orders unlock once you are approved."
					]
				}),
				/* @__PURE__ */ jsxs(Button, {
					className: "mt-6",
					disabled: true,
					children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " Add a book (locked)"]
				})
			]
		})
	});
	if (role !== "seller") return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-xl px-4 py-24 text-center",
		children: [/* @__PURE__ */ jsx("h1", {
			className: "font-display text-2xl tracking-wide",
			children: "Seller portal"
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-3 text-sm text-muted-foreground",
			children: "Switch the role selector to “Approved Seller” or “Pending Seller” to preview this area."
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-6xl px-4 py-10",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "text-center",
				children: [
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-3xl tracking-wide",
						children: activeUser.name
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-arabic-display mt-1 text-xl text-primary",
						children: "لوحة البائع"
					}),
					/* @__PURE__ */ jsx(BranchDivider, { className: "mt-4" })
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-8 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(Metric, {
						label: "Books listed",
						value: `${myBooks.length}`
					}),
					/* @__PURE__ */ jsx(Metric, {
						label: "Orders received",
						value: `${myOrders.length}`
					}),
					/* @__PURE__ */ jsx(Metric, {
						label: "Revenue",
						value: egp(revenue)
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "font-display text-xl tracking-wide",
						children: "Inventory"
					}), /* @__PURE__ */ jsxs(Button, {
						onClick: () => setEditing(blankBook(activeUser.id, categories[0] ?? "Fiction")),
						children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " Add book"]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Book" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Condition" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Price"
						}),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Stock"
						}),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] }) }), /* @__PURE__ */ jsxs(TableBody, { children: [myBooks.map((b) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx(BookCover, {
								book: b,
								className: "h-14 w-10 shrink-0"
							}), /* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("p", {
									className: "font-medium",
									children: b.title
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-muted-foreground",
									children: b.author
								}),
								b.flagged && /* @__PURE__ */ jsx(Badge, {
									className: "mt-1 bg-destructive/15 text-destructive",
									children: "Flagged"
								})
							] })]
						}) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-sm",
							children: b.category
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-sm",
							children: b.condition
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right tabular-nums",
							children: egp(b.price)
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right tabular-nums",
							children: b.availableQuantity
						}),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "text-right",
							children: [/* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: "ghost",
								"aria-label": "Edit",
								onClick: () => setEditing(b),
								children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
							}), /* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: "ghost",
								"aria-label": "Delete",
								className: "text-destructive",
								onClick: () => {
									deleteBook(b.id);
									toast.success(`${b.title} removed from your shelf`);
								},
								children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
							})]
						})
					] }, b.id)), myBooks.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 6,
						className: "py-10 text-center text-sm text-muted-foreground",
						children: "Your shelf is empty. Add your first book."
					}) })] })] })
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display mb-3 text-xl tracking-wide",
					children: "Fulfilment queue"
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto rounded-lg border bg-card",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Order" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Items" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Placed" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" })
					] }) }), /* @__PURE__ */ jsxs(TableBody, { children: [myOrders.map((o) => /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "font-medium",
							children: o.id
						}),
						/* @__PURE__ */ jsx(TableCell, { children: o.customerName }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-sm text-muted-foreground",
							children: o.lines.filter((l) => l.sellerId === activeUser.id).map((l) => `${l.title} ×${l.quantity}`).join(", ")
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-sm",
							children: o.placedAt
						}),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Select, {
							value: o.status,
							onValueChange: (v) => {
								setOrderStatus(o.id, v);
								toast.success(`${o.id} marked ${v}`);
							},
							children: [/* @__PURE__ */ jsx(SelectTrigger, {
								className: "h-8 w-[150px]",
								"aria-label": `Status for ${o.id}`,
								children: /* @__PURE__ */ jsx(SelectValue, {})
							}), /* @__PURE__ */ jsx(SelectContent, { children: statuses.map((s) => /* @__PURE__ */ jsx(SelectItem, {
								value: s,
								children: s
							}, s)) })]
						}) })
					] }, o.id)), myOrders.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 5,
						className: "py-10 text-center text-sm text-muted-foreground",
						children: "No orders yet."
					}) })] })] })
				})]
			}),
			/* @__PURE__ */ jsx(BookForm, {
				book: editing,
				categories,
				onClose: () => setEditing(null),
				onSave: (b) => {
					saveBook(b);
					setEditing(null);
					toast.success("Listing saved");
				}
			})
		]
	});
}
function Metric({ label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg border bg-card p-5",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-xs tracking-wide text-muted-foreground uppercase",
			children: label
		}), /* @__PURE__ */ jsx("p", {
			className: "font-display mt-1 text-2xl",
			children: value
		})]
	});
}
function blankBook(sellerId, category) {
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
		removed: false
	};
}
function BookForm({ book, categories, onClose, onSave }) {
	const [draft, setDraft] = useState(book);
	const [touched, setTouched] = useState(false);
	if (book && draft?.id !== book.id) setDraft(book);
	if (!book || !draft) return null;
	const errors = {
		title: draft.title.trim().length < 2 ? "Title is required." : "",
		author: draft.author.trim().length < 2 ? "Author is required." : "",
		price: draft.price <= 0 ? "Price must be above zero." : "",
		stock: draft.availableQuantity < 0 ? "Stock cannot be negative." : ""
	};
	const valid = Object.values(errors).every((e) => !e);
	const set = (p) => setDraft({
		...draft,
		...p
	});
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, {
					className: "font-display tracking-wide",
					children: book.title ? "Edit listing" : "Add a book"
				}) }),
				/* @__PURE__ */ jsxs("form", {
					className: "space-y-3",
					onSubmit: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ jsx(Text, {
							label: "Title",
							value: draft.title,
							onChange: (v) => set({ title: v }),
							error: touched ? errors.title : ""
						}),
						/* @__PURE__ */ jsx(Text, {
							label: "Arabic title (optional)",
							value: draft.titleAr ?? "",
							onChange: (v) => set({ titleAr: v })
						}),
						/* @__PURE__ */ jsx(Text, {
							label: "Author",
							value: draft.author,
							onChange: (v) => set({ author: v }),
							error: touched ? errors.author : ""
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ jsx(Text, {
								label: "Price (EGP)",
								type: "number",
								value: String(draft.price),
								onChange: (v) => set({ price: Number(v) }),
								error: touched ? errors.price : ""
							}), /* @__PURE__ */ jsx(Text, {
								label: "Stock",
								type: "number",
								value: String(draft.availableQuantity),
								onChange: (v) => set({ availableQuantity: Math.max(0, Number(v)) }),
								error: touched ? errors.stock : ""
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ jsx(Picker, {
								label: "Category",
								value: draft.category,
								options: categories,
								onChange: (v) => set({ category: v })
							}), /* @__PURE__ */ jsx(Picker, {
								label: "Condition",
								value: draft.condition,
								options: conditions,
								onChange: (v) => set({ condition: v })
							})]
						}),
						/* @__PURE__ */ jsx(Picker, {
							label: "Cover cloth",
							value: draft.spine,
							options: spines,
							onChange: (v) => set({ spine: v })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "bf-desc",
								children: "Description"
							}), /* @__PURE__ */ jsx(Textarea, {
								id: "bf-desc",
								value: draft.description,
								onChange: (e) => set({ description: e.target.value })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "bf-notes",
								children: "Condition notes"
							}), /* @__PURE__ */ jsx(Textarea, {
								id: "bf-notes",
								value: draft.conditionNotes,
								onChange: (e) => set({ conditionNotes: e.target.value })
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
					variant: "outline",
					onClick: onClose,
					children: "Cancel"
				}), /* @__PURE__ */ jsx(Button, {
					onClick: () => {
						setTouched(true);
						if (valid) onSave(draft);
					},
					children: "Save listing"
				})] })
			]
		})
	});
}
function Text({ label, value, onChange, type = "text", error }) {
	const id = `bf-${label.replace(/\W/g, "-").toLowerCase()}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ jsx(Label, {
				htmlFor: id,
				children: label
			}),
			/* @__PURE__ */ jsx(Input, {
				id,
				type,
				value,
				onChange: (e) => onChange(e.target.value),
				"aria-invalid": !!error
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "text-xs text-destructive",
				children: error
			})
		]
	});
}
function Picker({ label, value, options, onChange }) {
	const id = `bf-${label.replace(/\W/g, "-").toLowerCase()}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, {
			htmlFor: id,
			children: label
		}), /* @__PURE__ */ jsxs(Select, {
			value,
			onValueChange: onChange,
			children: [/* @__PURE__ */ jsx(SelectTrigger, {
				id,
				className: "w-full",
				children: /* @__PURE__ */ jsx(SelectValue, {})
			}), /* @__PURE__ */ jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsx(SelectItem, {
				value: o,
				children: o
			}, o)) })]
		})]
	});
}
//#endregion
export { SellerPortal as component };
