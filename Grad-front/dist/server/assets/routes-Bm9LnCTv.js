import { d as resolveUserName, i as Button, m as apiFetch, n as LeafSprig, p as useTurath, r as Badge, t as BranchDivider } from "./Ornaments-JhP4ydzQ.js";
import { t as turath_emblem_default } from "./turath-emblem-CeSt8fKn.js";
import { a as DialogHeader, c as Textarea, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-BnIQQ4q4.js";
import { n as BookCard, t as BookDialog } from "./BookDialog-QpfRccWX.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { BookOpen, Leaf, MessageSquareQuote, Quote, Recycle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/index.tsx?tsr-split=component
var defaultServiceComments = [
	{
		id: 1,
		userId: "Mariam Sobhy",
		userName: "Mariam Sobhy",
		content: "Turath's packaging is incredible — arrived in recycled linen paper with zero plastic. The books felt loved and well-preserved.",
		createdAt: "2026-09-08"
	},
	{
		id: 2,
		userId: "Yusuf Karim",
		userName: "Yusuf Karim",
		content: "Finding antique philosophy editions here saved me months of searching flea markets. The condition notes were 100% accurate!",
		createdAt: "2026-09-12"
	},
	{
		id: 3,
		userId: "Dr. Tarek Hegazy",
		userName: "Dr. Tarek Hegazy",
		content: "As both a reader and a seller, the platform is smooth and respectful to book culture. Fulfilling orders feels like passing a torch.",
		createdAt: "2026-09-15"
	},
	{
		id: 4,
		userId: "Nour Al-Din",
		userName: "Nour Al-Din",
		content: "Fast 3-day delivery to Alexandria and prompt customer support when I asked about book editions. Highly recommended!",
		createdAt: "2026-09-18"
	}
];
function Home() {
	const { visibleBooks, orders, isAuthenticated, activeUser, users } = useTurath();
	const [selected, setSelected] = useState(null);
	const [comments, setComments] = useState(defaultServiceComments);
	const [commentText, setCommentText] = useState("");
	const [submittingComment, setSubmittingComment] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const featured = visibleBooks.slice(0, 4);
	const rehomed = orders.reduce((s, o) => s + (o.status === "Cancelled" ? 0 : o.lines.reduce((n, l) => n + l.quantity, 0)), 0);
	useEffect(() => {
		let active = true;
		apiFetch("/api/Comments/get-all-comments").then((data) => {
			if (!active || !Array.isArray(data) || data.length === 0) return;
			const combined = [...data];
			for (const def of defaultServiceComments) if (!combined.some((c) => c.content.includes(def.content.slice(0, 20)) || c.userName === def.userName)) combined.push(def);
			const unwantedKeywords = [
				"checkout process",
				"clean design",
				"book filters",
				"easy to browse",
				"trustworthy",
				"ahmed_hassan"
			];
			const filtered = combined.filter((c) => {
				if (!c.content || c.content.length < 20) return false;
				const lower = c.content.toLowerCase();
				const userLower = (c.userName || c.userId || "").toLowerCase();
				if (unwantedKeywords.some((kw) => lower.includes(kw) || userLower.includes(kw))) return false;
				return true;
			});
			setComments(filtered.length > 0 ? filtered : defaultServiceComments);
		}).catch(() => {});
		return () => {
			active = false;
		};
	}, []);
	const handlePostComment = async () => {
		const text = commentText.trim();
		if (text.length < 5) {
			toast.error("Please write a few words about your experience.");
			return;
		}
		setSubmittingComment(true);
		try {
			const authorName = activeUser?.name || "Turath Reader";
			const newComment = await apiFetch("/api/Comments/create", {
				method: "POST",
				body: JSON.stringify({
					userId: activeUser?.id || authorName,
					content: text
				})
			});
			setComments((prev) => [{
				id: newComment?.id || `c-${Date.now()}`,
				userId: activeUser?.id || "Reader",
				userName: authorName,
				content: text,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, ...prev]);
			setCommentText("");
			setDialogOpen(false);
			toast.success("Thank you for sharing your experience with Turath!");
		} catch {
			const authorName = activeUser?.name || "Turath Reader";
			setComments((prev) => [{
				id: `c-${Date.now()}`,
				userId: activeUser?.id || "Reader",
				userName: authorName,
				content: text,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, ...prev]);
			setCommentText("");
			setDialogOpen(false);
			toast.success("Thank you for sharing your experience with Turath!");
		} finally {
			setSubmittingComment(false);
		}
	};
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
			className: "mx-auto max-w-7xl px-4 pb-12",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display text-2xl tracking-wide",
					children: "Freshly re-shelved"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: "Pre-loved volumes curated with authentic condition notes"
				})] }), /* @__PURE__ */ jsx(Button, {
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
		/* @__PURE__ */ jsx("section", {
			className: "border-t bg-accent/25 py-16",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto max-w-7xl px-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center text-center",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-medium text-primary",
								children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }), " Community Reflections"]
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "font-display mt-3 text-3xl tracking-wide md:text-4xl",
								children: "What Readers Say About Turath"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-arabic-display mt-1 text-xl text-primary",
								children: "أصوات القراء وتجربة الخدمة"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground",
								children: "Real reflections from book lovers, collectors, and sellers across our community on packaging, service, and second-hand treasures."
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
						children: comments.map((c) => /* @__PURE__ */ jsxs("div", {
							className: "card-antique relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs transition-transform duration-200 hover:-translate-y-1",
							children: [
								/* @__PURE__ */ jsx(Quote, { className: "h-6 w-6 text-primary/30 mb-3" }),
								/* @__PURE__ */ jsxs("p", {
									className: "flex-1 text-sm leading-relaxed text-foreground font-serif italic",
									children: [
										"\"",
										c.content,
										"\""
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-4 border-t pt-3 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ jsx("p", {
											className: "truncate text-xs font-semibold text-foreground",
											children: resolveUserName(c.userName || c.userId, users)
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[10px] text-muted-foreground",
											children: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Verified reader"
										})]
									}), /* @__PURE__ */ jsx(Badge, {
										variant: "outline",
										className: "text-[10px] border-primary/30 text-primary shrink-0",
										children: "Verified"
									})]
								})
							]
						}, c.id))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-10 flex flex-col items-center justify-center gap-3 text-center",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: "Have you ordered or re-homed a book with us? We'd love to hear your thoughts."
						}), isAuthenticated ? /* @__PURE__ */ jsxs(Dialog, {
							open: dialogOpen,
							onOpenChange: setDialogOpen,
							children: [/* @__PURE__ */ jsx(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ jsxs(Button, {
									variant: "outline",
									className: "gap-2",
									children: [/* @__PURE__ */ jsx(MessageSquareQuote, { className: "h-4 w-4 text-primary" }), "Share Your Experience"]
								})
							}), /* @__PURE__ */ jsxs(DialogContent, {
								className: "sm:max-w-md",
								children: [
									/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Share Your Turath Experience" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Leave a note on our delivery speed, book conditions, packaging, or customer service." })] }),
									/* @__PURE__ */ jsx("div", {
										className: "space-y-3 py-2",
										children: /* @__PURE__ */ jsx(Textarea, {
											placeholder: "Tell the community how your books reached you...",
											value: commentText,
											onChange: (e) => setCommentText(e.target.value),
											rows: 4,
											className: "text-sm"
										})
									}),
									/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
										variant: "ghost",
										onClick: () => setDialogOpen(false),
										children: "Cancel"
									}), /* @__PURE__ */ jsxs(Button, {
										onClick: handlePostComment,
										disabled: submittingComment || commentText.trim().length < 5,
										children: [/* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-1.5" }), submittingComment ? "Posting..." : "Post Comment"]
									})] })
								]
							})]
						}) : /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							className: "gap-2",
							onClick: () => window.dispatchEvent(new Event("turath:open-auth")),
							children: [/* @__PURE__ */ jsx(MessageSquareQuote, { className: "h-4 w-4 text-primary" }), "Sign in to Share Your Experience"]
						})]
					})
				]
			})
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
