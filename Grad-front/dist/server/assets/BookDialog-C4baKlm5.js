import { c as egp, r as Badge, s as avgRating, u as useTurath } from "./Ornaments-BLU82UQZ.js";
import { t as Button } from "./button-BixuqtKh.js";
import { t as Separator } from "./separator-CnQP0a8F.js";
import { t as BookCover } from "./BookCover-0ywG3LRk.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, t as Dialog } from "./dialog-CS3HFS5X.js";
import { t as Textarea } from "./textarea-CorrVEk_.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Heart, ShoppingBasket, Star } from "lucide-react";
import { toast } from "sonner";
//#region src/components/turath/Stars.tsx
function Stars({ value, count, className = "" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `flex items-center gap-1 ${className}`,
		"aria-label": `Rated ${value.toFixed(1)} of 5`,
		children: [[
			1,
			2,
			3,
			4,
			5
		].map((n) => /* @__PURE__ */ jsx(Star, {
			className: `h-4 w-4 ${n <= Math.round(value) ? "fill-amber-gold text-amber-gold" : "text-border"}`,
			"aria-hidden": "true"
		}, n)), /* @__PURE__ */ jsxs("span", {
			className: "ml-1 text-xs text-muted-foreground",
			children: [value ? value.toFixed(1) : "—", count !== void 0 && ` (${count})`]
		})]
	});
}
//#endregion
//#region src/components/turath/BookCard.tsx
function BookCard({ book, onOpen }) {
	const { addToCart, toggleWishlist, wishlist, sellerName } = useTurath();
	const wished = wishlist.includes(book.id);
	const displaySeller = book.sellerName || sellerName(book.sellerId, book.sellerName);
	return /* @__PURE__ */ jsxs("article", {
		className: "card-antique group flex flex-col overflow-hidden",
		children: [/* @__PURE__ */ jsxs("button", {
			onClick: () => onOpen(book),
			className: "relative block bg-ivory p-5 text-left",
			"aria-label": `Open details for ${book.title}`,
			children: [
				/* @__PURE__ */ jsx(BookCover, {
					book,
					className: "mx-auto aspect-[3/4] w-full max-w-[190px] transition-transform duration-300 group-hover:-rotate-1"
				}),
				/* @__PURE__ */ jsx(Badge, {
					className: "absolute top-3 left-3 bg-primary/90 text-primary-foreground",
					children: book.condition
				}),
				book.availableQuantity === 0 && /* @__PURE__ */ jsx(Badge, {
					className: "absolute top-3 right-3 bg-destructive text-destructive-foreground",
					children: "Out of stock"
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 flex-col gap-2 border-t p-4",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "font-serif text-base leading-tight font-semibold",
					children: book.title
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: book.author
				})] }),
				/* @__PURE__ */ jsx(Stars, {
					value: avgRating(book),
					count: book.reviews?.length ?? 0
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-xs text-muted-foreground",
					children: [
						book.category,
						" · ",
						displaySeller
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-auto flex items-center gap-2 pt-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-display text-lg text-rust",
							children: egp(book.price)
						}),
						/* @__PURE__ */ jsx(Button, {
							size: "icon",
							variant: "ghost",
							className: "ml-auto h-8 w-8",
							"aria-label": wished ? "Remove from wishlist" : "Add to wishlist",
							onClick: () => toggleWishlist(book.id),
							children: /* @__PURE__ */ jsx(Heart, { className: `h-4 w-4 ${wished ? "fill-rust text-rust" : ""}` })
						}),
						/* @__PURE__ */ jsxs(Button, {
							size: "sm",
							disabled: book.availableQuantity === 0,
							onClick: () => {
								addToCart(book.id);
								toast.success(`${book.title} added`);
							},
							children: [/* @__PURE__ */ jsx(ShoppingBasket, { className: "h-4 w-4" }), "Add"]
						})
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/turath/BookDialog.tsx
function BookDialog({ book, onOpenChange }) {
	const { addToCart, toggleWishlist, wishlist, sellerName, addReview, activeUser, orders, role } = useTurath();
	const [angle, setAngle] = useState(0);
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");
	if (!book) return null;
	const wished = wishlist.includes(book.id);
	const purchased = orders.some((o) => o.customerId === activeUser.id && o.lines.some((l) => l.bookId === book.id));
	const canReview = role === "customer" && purchased;
	const submitReview = () => {
		if (comment.trim().length < 4) return;
		addReview(book.id, {
			author: activeUser.name,
			rating,
			comment: comment.trim(),
			verified: true
		});
		setComment("");
		toast.success("Review published");
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: !!book,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-3xl",
			children: [
				/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, {
					className: "font-display text-xl tracking-wide",
					children: book.title
				}) }),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-6 md:grid-cols-[260px_1fr]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ jsx(BookCover, {
							book,
							angle: book.images[angle] ?? "front",
							className: "aspect-[3/4] w-full"
						}), /* @__PURE__ */ jsx("div", {
							className: "flex gap-2",
							children: book.images.map((img, i) => /* @__PURE__ */ jsx("button", {
								onClick: () => setAngle(i),
								"aria-label": `View ${img}`,
								"aria-pressed": angle === i,
								className: `overflow-hidden rounded-sm border-2 transition ${angle === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`,
								children: /* @__PURE__ */ jsx(BookCover, {
									book,
									angle: img,
									className: "h-16 w-12"
								})
							}, img))
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-4",
						children: [
							book.titleAr && /* @__PURE__ */ jsx("p", {
								className: "font-arabic-display text-2xl text-primary",
								children: book.titleAr
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "text-sm text-muted-foreground",
								children: ["by ", book.author]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ jsx(Badge, {
										variant: "secondary",
										children: book.category
									}),
									/* @__PURE__ */ jsx(Badge, {
										className: "bg-accent text-accent-foreground",
										children: book.condition
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-1 rounded-full border border-primary/30 px-2 py-0.5 text-xs text-primary",
										children: [
											/* @__PURE__ */ jsx(Leaf$1, {}),
											" ",
											sellerName(book.sellerId)
										]
									})
								]
							}),
							/* @__PURE__ */ jsx(Stars, {
								value: avgRating(book),
								count: book.reviews.length
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-sm leading-relaxed",
								children: book.description
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "rounded-md bg-muted p-3 text-sm",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-semibold",
									children: "Condition notes: "
								}), book.conditionNotes]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-display text-2xl text-rust",
									children: egp(book.price)
								}), /* @__PURE__ */ jsx("span", {
									className: `text-sm ${book.availableQuantity > 0 ? "text-primary" : "text-destructive"}`,
									children: book.availableQuantity > 0 ? `${book.availableQuantity} copies remaining` : "Out of stock"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ jsxs(Button, {
									disabled: book.availableQuantity === 0,
									onClick: () => {
										addToCart(book.id);
										toast.success("Added to your satchel");
									},
									children: [/* @__PURE__ */ jsx(ShoppingBasket, { className: "h-4 w-4" }), " Add to cart"]
								}), /* @__PURE__ */ jsxs(Button, {
									variant: "outline",
									onClick: () => toggleWishlist(book.id),
									children: [/* @__PURE__ */ jsx(Heart, { className: `h-4 w-4 ${wished ? "fill-rust text-rust" : ""}` }), wished ? "Saved" : "Wishlist"]
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx(Separator, {}),
				/* @__PURE__ */ jsxs("section", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "font-display text-lg tracking-wide",
							children: "Readers before you"
						}),
						book.reviews.length === 0 && /* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: "No reviews yet for this copy."
						}),
						/* @__PURE__ */ jsx("ul", {
							className: "space-y-3",
							children: book.reviews.map((r) => /* @__PURE__ */ jsxs("li", {
								className: "rounded-lg border bg-card p-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "font-medium",
												children: r.author
											}),
											r.verified && /* @__PURE__ */ jsx(Badge, {
												variant: "secondary",
												className: "text-[0.65rem]",
												children: "Verified reader"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "ml-auto text-xs text-muted-foreground",
												children: r.date
											})
										]
									}),
									/* @__PURE__ */ jsx(Stars, {
										value: r.rating,
										className: "mt-1"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm",
										children: r.comment
									})
								]
							}, r.id))
						}),
						canReview ? /* @__PURE__ */ jsxs("div", {
							className: "space-y-2 rounded-lg border border-dashed p-3",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-sm font-medium",
									children: "Leave your note for the next reader"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "flex gap-1",
									role: "radiogroup",
									"aria-label": "Your rating",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((n) => /* @__PURE__ */ jsx("button", {
										role: "radio",
										"aria-checked": rating === n,
										"aria-label": `${n} stars`,
										onClick: () => setRating(n),
										children: /* @__PURE__ */ jsx(Star, { className: `h-5 w-5 ${n <= rating ? "fill-amber-gold text-amber-gold" : "text-muted-foreground"}` })
									}, n))
								}),
								/* @__PURE__ */ jsx(Textarea, {
									value: comment,
									onChange: (e) => setComment(e.target.value),
									maxLength: 400,
									placeholder: "How did this copy reach you?"
								}),
								/* @__PURE__ */ jsx(Button, {
									size: "sm",
									disabled: comment.trim().length < 4,
									onClick: submitReview,
									children: "Publish review"
								})
							]
						}) : /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: "Only customers who have ordered this book can review it."
						})
					]
				})
			]
		})
	});
}
function Leaf$1() {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 16 16",
		className: "h-3 w-3",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsx("path", {
			d: "M2 14C2 7 7 2 14 2c0 7-5 12-12 12Z",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.3"
		})
	});
}
//#endregion
export { BookCard as n, BookDialog as t };
