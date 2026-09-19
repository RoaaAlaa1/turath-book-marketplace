import { d as apiFetch, r as Badge, t as BranchDivider, u as useTurath } from "./Ornaments-DpRPolS7.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { BookOpen, MapPin, Phone, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/account.tsx?tsr-split=component
function Account() {
	const { activeUser, isAuthenticated, updateProfile } = useTurath();
	const isSeller = activeUser.role === "seller";
	const sellerRequestPending = activeUser.sellerState === "pending";
	const displayName = isAuthenticated ? activeUser.name : "Name";
	const displayEmail = isAuthenticated ? activeUser.email : "name@example.com";
	const handleSellerRequest = async () => {
		if (!isAuthenticated) {
			toast.error("Sign in first to request seller access.");
			return;
		}
		if (!localStorage.getItem("token")) {
			toast.error("Your session is not active. Please sign in again.");
			return;
		}
		try {
			const data = await apiFetch("/api/SellerRequests/apply", { method: "POST" });
			updateProfile(activeUser.id, { sellerState: "pending" });
			toast.success(data?.message || "Seller request submitted successfully.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Unable to submit seller request.");
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-3xl px-4 py-10",
		children: [/* @__PURE__ */ jsxs("header", {
			className: "text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "font-display text-3xl tracking-wide",
					children: "My Account"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "font-arabic-display mt-1 text-xl text-primary",
					children: "حسابي"
				}),
				/* @__PURE__ */ jsx(BranchDivider, { className: "mt-4" })
			]
		}), /* @__PURE__ */ jsxs("section", {
			className: "mt-8 rounded-lg border bg-card p-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-start gap-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: "flex h-16 w-16 items-center justify-center rounded-full bg-accent font-display text-2xl text-accent-foreground",
						children: activeUser.name.charAt(0).toUpperCase()
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("h2", {
									className: "font-serif text-2xl",
									children: displayName
								}),
								/* @__PURE__ */ jsx(Badge, {
									variant: "outline",
									children: isSeller ? "Seller" : "Customer"
								}),
								!isAuthenticated && /* @__PURE__ */ jsx(Badge, {
									className: "bg-amber-gold/25 text-foreground",
									children: "Demo profile"
								})
							]
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: displayEmail
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ jsx(Detail, {
							icon: /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
							label: "Phone",
							value: activeUser.phone ?? "Not added yet"
						}),
						/* @__PURE__ */ jsx(Detail, {
							icon: /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
							label: isSeller ? "Store location" : "Default address",
							value: activeUser.address ?? "Not added yet"
						}),
						isSeller ? /* @__PURE__ */ jsx(Detail, {
							icon: /* @__PURE__ */ jsx(Store, { className: "h-4 w-4" }),
							label: "Store name",
							value: activeUser.storeName ?? activeUser.name
						}) : /* @__PURE__ */ jsx(Detail, {
							icon: /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }),
							label: "Preferred genres",
							value: activeUser.genres?.join(", ") || "Not added yet"
						}),
						/* @__PURE__ */ jsx(Detail, {
							icon: /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
							label: "Member since",
							value: activeUser.joined
						})
					]
				}),
				isAuthenticated && !isSeller && /* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: sellerRequestPending ? /* @__PURE__ */ jsx(Badge, {
						className: "bg-amber-100 text-amber-900",
						children: "Seller request pending"
					}) : /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: handleSellerRequest,
						className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90",
						children: "Request to be a seller"
					})
				}),
				isSeller && /* @__PURE__ */ jsxs("div", {
					className: "mt-6 rounded-md bg-muted p-4",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-xs tracking-wide text-muted-foreground uppercase",
							children: "Store bio"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm leading-relaxed",
							children: activeUser.bio || "No store bio added yet."
						}),
						activeUser.sellerState && /* @__PURE__ */ jsxs("p", {
							className: "mt-3 text-xs text-muted-foreground",
							children: ["Seller status: ", activeUser.sellerState]
						})
					]
				})
			]
		})]
	});
}
function Detail({ icon, label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex gap-3",
		children: [/* @__PURE__ */ jsx("span", {
			className: "mt-0.5 text-primary",
			children: icon
		}), /* @__PURE__ */ jsxs("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-xs tracking-wide text-muted-foreground uppercase",
				children: label
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 break-words text-sm",
				children: value
			})]
		})]
	});
}
//#endregion
export { Account as component };
