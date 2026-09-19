import { n as LeafSprig, t as BranchDivider, u as useTurath } from "./Ornaments-DpRPolS7.js";
import { t as turath_emblem_default } from "./turath-emblem-CeSt8fKn.js";
import { t as Button } from "./button-D_e608pH.js";
import { n as BookCard, t as BookDialog } from "./BookDialog-BjDjfXzb.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { BookOpen, Leaf, Recycle } from "lucide-react";
//#region src/routes/index.tsx?tsr-split=component
function Home() {
	const { visibleBooks, orders } = useTurath();
	const [selected, setSelected] = useState(null);
	const featured = visibleBooks.slice(0, 4);
	const rehomed = orders.reduce((s, o) => s + (o.status === "Cancelled" ? 0 : o.lines.reduce((n, l) => n + l.quantity, 0)), 0);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "paper-grain relative overflow-hidden",
			children: [
				/* @__PURE__ */ jsx(LeafSprig, { className: "pointer-events-none absolute -top-6 -left-10 h-56 w-56 text-sage-soft/40" }),
				/* @__PURE__ */ jsx(LeafSprig, { className: "pointer-events-none absolute right-0 -bottom-10 h-64 w-64 -scale-x-100 text-sage-soft/30" }),
				/* @__PURE__ */ jsxs("div", {
					className: "mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-accent/50 px-3 py-1 text-xs tracking-wide text-accent-foreground uppercase",
								children: [/* @__PURE__ */ jsx(Leaf, { className: "h-3.5 w-3.5" }), " Sustainable · Pre-loved · Recycled"]
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "font-display text-4xl leading-tight tracking-wide md:text-6xl",
								children: ["Turath", /* @__PURE__ */ jsx("span", {
									className: "font-arabic-display mt-2 block text-3xl text-primary md:text-5xl",
									children: "تراث"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-arabic-display text-2xl text-rust md:text-3xl",
								children: "أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "max-w-md text-base leading-relaxed text-muted-foreground",
								children: "Give books a new life. Every volume here has already been held, annotated and loved — and is waiting for its next reader."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap gap-3",
								children: [/* @__PURE__ */ jsx(Button, {
									asChild: true,
									size: "lg",
									children: /* @__PURE__ */ jsx(Link, {
										to: "/shop",
										children: "Browse the shelves"
									})
								}), /* @__PURE__ */ jsx(Button, {
									size: "lg",
									variant: "outline",
									onClick: () => {
										const el = typeof document !== "undefined" ? document.getElementById("story") : null;
										if (el) {
											el.scrollIntoView({
												behavior: "smooth",
												block: "start"
											});
											try {
												history.replaceState(null, "", "#story");
											} catch {}
										} else window.location.hash = "#story";
									},
									children: "قصتنا · Our Story"
								})]
							})
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "relative",
						children: /* @__PURE__ */ jsx("img", {
							src: turath_emblem_default,
							alt: "Turath emblem: a stack of antique books wreathed in olive branches",
							width: 1024,
							height: 1024,
							className: "mx-auto w-full max-w-md drop-shadow-[0_25px_45px_rgba(60,50,30,0.18)] emblem-animate"
						})
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx("section", {
			className: "border-y bg-ivory/70",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						icon: /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5" }),
						value: `${visibleBooks.length}`,
						label: "Volumes on the shelves"
					}),
					/* @__PURE__ */ jsx(Stat, {
						icon: /* @__PURE__ */ jsx(Recycle, { className: "h-5 w-5" }),
						value: `${rehomed}`,
						label: "Books re-homed so far"
					}),
					/* @__PURE__ */ jsx(Stat, {
						icon: /* @__PURE__ */ jsx(Leaf, { className: "h-5 w-5" }),
						value: `${(rehomed * 2.5).toFixed(1)} kg`,
						label: "Paper spared from waste"
					})
				]
			})
		}),
		/* @__PURE__ */ jsxs("section", {
			id: "story",
			className: "mx-auto max-w-4xl scroll-mt-24 px-4 py-16 text-center",
			children: [
				/* @__PURE__ */ jsx(BranchDivider, { className: "mb-8" }),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs tracking-[0.35em] text-muted-foreground uppercase",
					children: "Our Story"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "font-arabic-display mt-3 text-3xl text-primary md:text-4xl",
					children: "تراث، أَصْل، وتَفَرُّع"
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "font-display mt-2 text-xl tracking-wide md:text-2xl",
					children: "Heritage · Root · Branch"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 space-y-4 text-left text-base leading-relaxed text-muted-foreground md:text-center",
					children: [/* @__PURE__ */ jsx("p", { children: "A book is not a disposable object. It is rooted knowledge. Like a tree that grows and branches out with each passing season, every pre-owned book carries branches of human heritage — moving from reader to reader, classroom to home, generation to generation." }), /* @__PURE__ */ jsxs("p", { children: [
						"The name ",
						/* @__PURE__ */ jsx("span", {
							className: "font-semibold text-foreground",
							children: "Turath"
						}),
						" means heritage: what we inherit and are trusted to pass on. The olive branches in our emblem are those hands, and the stacked spines are the seasons a book survives. Pencil notes in a margin, a name crossed out on a flyleaf, a coffee ring on a back cover — these are not damage. They are the rings of the trunk."
					] })]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "font-arabic-display mt-8 text-3xl text-rust md:text-4xl",
					children: "أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 text-sm tracking-wide text-muted-foreground",
					children: "Give books a new life"
				}),
				/* @__PURE__ */ jsx(BranchDivider, { className: "mt-8" })
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mx-auto max-w-7xl px-4 pb-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display text-2xl tracking-wide",
					children: "Freshly re-shelved"
				}), /* @__PURE__ */ jsx(Button, {
					asChild: true,
					variant: "ghost",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/shop",
						children: "See all books →"
					})
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
				children: featured.map((b) => /* @__PURE__ */ jsx(BookCard, {
					book: b,
					onOpen: setSelected
				}, b.id))
			})]
		}),
		/* @__PURE__ */ jsx(BookDialog, {
			book: selected,
			onOpenChange: (o) => !o && setSelected(null)
		})
	] });
}
function Stat({ icon, value, label }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-1 text-center",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "text-primary",
				children: icon
			}),
			/* @__PURE__ */ jsx("span", {
				className: "font-display text-2xl",
				children: value
			}),
			/* @__PURE__ */ jsx("span", {
				className: "text-xs tracking-wide text-muted-foreground uppercase",
				children: label
			})
		]
	});
}
//#endregion
export { Home as component };
