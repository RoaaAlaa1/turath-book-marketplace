import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/turath/BookCover.tsx
var spineStyles = {
	rust: {
		bg: "oklch(0.52 0.13 40)",
		ink: "oklch(0.94 0.05 80)"
	},
	navy: {
		bg: "oklch(0.42 0.075 250)",
		ink: "oklch(0.93 0.04 85)"
	},
	amber: {
		bg: "oklch(0.68 0.11 78)",
		ink: "oklch(0.25 0.04 70)"
	},
	sage: {
		bg: "oklch(0.55 0.05 143)",
		ink: "oklch(0.95 0.03 90)"
	},
	crimson: {
		bg: "oklch(0.44 0.14 22)",
		ink: "oklch(0.93 0.05 80)"
	}
};
/** A drawn cloth-bound cover: no external imagery, styled from the book's own data. */
function BookCover({ book, angle = "front", className = "" }) {
	const s = spineStyles[book.spine];
	const detail = angle !== "front";
	return /* @__PURE__ */ jsxs("div", {
		className: `relative overflow-hidden rounded-sm ${className}`,
		style: {
			background: `linear-gradient(120deg, ${s.bg}, color-mix(in oklab, ${s.bg} 78%, black))`,
			color: s.ink
		},
		role: "img",
		"aria-label": `${book.title} by ${book.author}, ${angle} view`,
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-y-0 left-0 w-[9%]",
				style: { background: "color-mix(in oklab, black 22%, transparent)" }
			}),
			/* @__PURE__ */ jsx("span", {
				className: "absolute inset-2 rounded-[2px] border",
				style: { borderColor: "color-mix(in oklab, currentColor 35%, transparent)" }
			}),
			detail && /* @__PURE__ */ jsx("span", {
				className: "absolute inset-y-0 right-0 w-[16%]",
				style: { backgroundImage: "repeating-linear-gradient(90deg, oklch(0.93 0.02 85), oklch(0.93 0.02 85) 1px, oklch(0.86 0.03 84) 2px, oklch(0.86 0.03 84) 3px)" }
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative flex h-full flex-col items-center justify-between px-4 py-6 text-center",
				children: [
					/* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 40 12",
						className: "h-3 w-10 opacity-70",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsx("path", {
							d: "M2 6h12M26 6h12M20 1c3 2 3 8 0 10-3-2-3-8 0-10Z",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "1"
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1",
						children: [
							book.titleAr && /* @__PURE__ */ jsx("p", {
								className: "font-arabic-display text-lg leading-tight opacity-90",
								children: book.titleAr
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-display text-[0.78rem] leading-snug font-semibold tracking-wide uppercase",
								children: book.title
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-[0.62rem] tracking-[0.18em] uppercase opacity-75",
								children: book.author
							})
						]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "block h-px w-10",
						style: { background: "color-mix(in oklab, currentColor 50%, transparent)" }
					})
				]
			})
		]
	});
}
//#endregion
export { BookCover as t };
