import { s as avgRating, t as BranchDivider, u as useTurath } from "./Ornaments-CoU_issj.js";
import { t as Button } from "./button-DZm0wz2G.js";
import { n as Input, t as Label } from "./label-DoWJhLyc.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Czt_Sw8b.js";
import { n as BookCard, t as BookDialog } from "./BookDialog-Cgg61tWU.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Search } from "lucide-react";
//#region src/routes/shop.tsx?tsr-split=component
var conditions = [
	"Acceptable",
	"Good",
	"Like New",
	"Vintage Collector"
];
function Shop() {
	const { visibleBooks, categories } = useTurath();
	const [q, setQ] = useState("");
	const [cat, setCat] = useState("all");
	const [cond, setCond] = useState("all");
	const [sort, setSort] = useState("relevance");
	const [selected, setSelected] = useState(null);
	const results = useMemo(() => {
		const term = q.trim().toLowerCase();
		const list = visibleBooks.filter((b) => {
			return (!term || [
				b.title,
				b.titleAr ?? "",
				b.author,
				b.description,
				b.category
			].some((f) => f.toLowerCase().includes(term))) && (cat === "all" || b.category === cat) && (cond === "all" || b.condition === cond);
		});
		if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
		if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
		if (sort === "rating") list.sort((a, b) => avgRating(b) - avgRating(a));
		return list;
	}, [
		visibleBooks,
		q,
		cat,
		cond,
		sort
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-7xl px-4 py-10",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "text-center",
				children: [
					/* @__PURE__ */ jsx("h1", {
						className: "font-display text-3xl tracking-wide",
						children: "The Shelves"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "font-arabic-display mt-1 text-xl text-primary",
						children: "رفوف الكتب"
					}),
					/* @__PURE__ */ jsx(BranchDivider, { className: "mt-4" })
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-8 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_auto_auto_auto]",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "shop-search",
							className: "text-xs",
							children: "Search"
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(Search, { className: "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
								id: "shop-search",
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Title, author or keyword",
								className: "pl-9"
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Category",
						value: cat,
						onChange: setCat,
						options: ["all", ...categories]
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Condition",
						value: cond,
						onChange: setCond,
						options: ["all", ...conditions]
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Sort by",
						value: sort,
						onChange: setSort,
						options: [
							"relevance",
							"price-asc",
							"price-desc",
							"rating"
						],
						labels: {
							relevance: "Relevance",
							"price-asc": "Price: low to high",
							"price-desc": "Price: high to low",
							rating: "Highest rated"
						}
					})
				]
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: [
					results.length,
					" ",
					results.length === 1 ? "volume" : "volumes",
					" found"
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				children: results.map((b) => /* @__PURE__ */ jsx(BookCard, {
					book: b,
					onOpen: setSelected
				}, b.id))
			}),
			results.length === 0 && /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-arabic-display text-2xl text-primary",
						children: "لا توجد نتائج"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "No books match this search. Try loosening a filter."
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						className: "mt-4",
						onClick: () => {
							setQ("");
							setCat("all");
							setCond("all");
						},
						children: "Clear filters"
					})
				]
			}),
			/* @__PURE__ */ jsx(BookDialog, {
				book: selected,
				onOpenChange: (o) => !o && setSelected(null)
			})
		]
	});
}
function Field({ label, value, onChange, options, labels }) {
	const id = `field-${label.replace(/\s/g, "-").toLowerCase()}`;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, {
			htmlFor: id,
			className: "text-xs",
			children: label
		}), /* @__PURE__ */ jsxs(Select, {
			value,
			onValueChange: onChange,
			children: [/* @__PURE__ */ jsx(SelectTrigger, {
				id,
				className: "w-full md:w-[190px]",
				children: /* @__PURE__ */ jsx(SelectValue, {})
			}), /* @__PURE__ */ jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsx(SelectItem, {
				value: o,
				children: labels?.[o] ?? (o === "all" ? `All ${label.toLowerCase()}` : o)
			}, o)) })]
		})]
	});
}
//#endregion
export { Shop as component };
