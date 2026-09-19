import { c as egp, r as Badge, t as BranchDivider, u as useTurath } from "./Ornaments-CoU_issj.js";
import { t as Button } from "./button-DZm0wz2G.js";
import { t as Separator } from "./separator-DIJBpBnG.js";
import { n as statusTone } from "./orders-CsmjkFjI.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/routes/orders.tsx?tsr-split=component
var timeline = [
	"Pending",
	"Confirmed",
	"Shipped",
	"Delivered"
];
function Orders() {
	const { orders, activeUser, cancelOrder } = useTurath();
	const mine = orders.filter((o) => o.customerId === activeUser.id);
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-4xl px-4 py-10",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "text-center",
				children: [
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-3xl tracking-wide",
						children: "My Orders"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-arabic-display mt-1 text-xl text-primary",
						children: "طلباتي"
					}),
					/* @__PURE__ */ jsx(BranchDivider, { className: "mt-4" })
				]
			}),
			mine.length === 0 && /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "No orders yet."
				}), /* @__PURE__ */ jsx(Button, {
					asChild: true,
					className: "mt-4",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/shop",
						children: "Find a book"
					})
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-8 space-y-5",
				children: mine.map((o) => {
					const stage = timeline.indexOf(o.status);
					return /* @__PURE__ */ jsxs("article", {
						className: "rounded-lg border bg-card p-5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "font-display text-lg",
										children: o.id
									}),
									/* @__PURE__ */ jsx(Badge, {
										className: statusTone[o.status],
										children: o.status
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "text-xs text-muted-foreground",
										children: ["Placed ", o.placedAt]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "ml-auto font-semibold",
										children: egp(o.total)
									})
								]
							}),
							/* @__PURE__ */ jsx("ul", {
								className: "mt-4 space-y-1 text-sm",
								children: o.lines.map((l) => /* @__PURE__ */ jsxs("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ jsxs("span", { children: [
										l.title,
										" ",
										/* @__PURE__ */ jsxs("span", {
											className: "text-muted-foreground",
											children: ["× ", l.quantity]
										})
									] }), /* @__PURE__ */ jsx("span", {
										className: "tabular-nums text-muted-foreground",
										children: egp(l.price * l.quantity)
									})]
								}, l.bookId))
							}),
							/* @__PURE__ */ jsx(Separator, { className: "my-4" }),
							o.status === "Cancelled" ? /* @__PURE__ */ jsx("p", {
								className: "text-sm text-destructive",
								children: "This order was cancelled."
							}) : /* @__PURE__ */ jsx("ol", {
								className: "flex items-center gap-2",
								"aria-label": "Order timeline",
								children: timeline.map((t, i) => /* @__PURE__ */ jsxs("li", {
									className: "flex flex-1 items-center gap-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex flex-col items-center gap-1",
										children: [/* @__PURE__ */ jsx("span", { className: `h-3 w-3 rounded-full ${i <= stage ? "bg-primary" : "bg-border"}` }), /* @__PURE__ */ jsx("span", {
											className: `text-[0.65rem] ${i <= stage ? "text-foreground" : "text-muted-foreground"}`,
											children: t
										})]
									}), i < timeline.length - 1 && /* @__PURE__ */ jsx("span", { className: `h-px flex-1 ${i < stage ? "bg-primary" : "bg-border"}` })]
								}, t))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-xs text-muted-foreground",
									children: ["Ships to ", o.address]
								}), /* @__PURE__ */ jsx(Button, {
									size: "sm",
									variant: "outline",
									className: "ml-auto text-destructive",
									disabled: o.status !== "Pending",
									onClick: () => {
										cancelOrder(o.id);
										toast.success(`Order ${o.id} cancelled`);
									},
									children: "Cancel order"
								})]
							})
						]
					}, o.id);
				})
			})
		]
	});
}
//#endregion
export { Orders as component };
