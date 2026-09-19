import { d as apiFetch, r as Badge, t as BranchDivider, u as useTurath } from "./Ornaments-Coe9p7fj.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { BookOpen, MapPin, Phone, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/account.tsx?tsr-split=component
function Account() {
	const { activeUser, isAuthenticated, updateProfile } = useTurath();
	const user = activeUser ?? {
		id: "",
		name: "Guest Reader",
		email: "guest@example.com",
		role: "customer",
		joined: "Today",
		status: "active",
		phone: void 0,
		address: void 0,
		storeName: void 0,
		genres: [],
		bio: void 0,
		sellerState: void 0
	};
	const isSeller = user.role === "seller";
	const sellerRequestPending = user.sellerState === "pending";
	const displayName = isAuthenticated ? user.name : "Guest Reader";
	const displayEmail = isAuthenticated ? user.email : "guest@example.com";
	const handleSellerRequest = async () => {
		if (!isAuthenticated || !activeUser) {
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
		children: [
			/* @__PURE__ */ jsxs("header", {
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
			}),
			!isAuthenticated && /* @__PURE__ */ jsxs("div", {
				className: "mt-6 rounded-lg border border-primary/20 bg-accent/30 p-4 text-center",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm font-medium",
						children: "You are currently exploring as a guest."
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Sign in to view your orders, wishlist, and profile details."
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => window.dispatchEvent(new Event("turath:open-auth")),
						className: "mt-3 inline-flex items-center rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90",
						children: "Sign In / Create Account"
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8 rounded-lg border bg-card p-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-start gap-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-16 w-16 items-center justify-center rounded-full bg-accent font-display text-2xl text-accent-foreground",
							children: displayName.charAt(0).toUpperCase()
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
										children: "Guest profile"
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
								value: user.phone ?? "Not added yet"
							}),
							/* @__PURE__ */ jsx(Detail, {
								icon: /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
								label: isSeller ? "Store location" : "Default address",
								value: user.address ?? "Not added yet"
							}),
							isSeller ? /* @__PURE__ */ jsx(Detail, {
								icon: /* @__PURE__ */ jsx(Store, { className: "h-4 w-4" }),
								label: "Store name",
								value: user.storeName ?? user.name
							}) : /* @__PURE__ */ jsx(Detail, {
								icon: /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }),
								label: "Preferred genres",
								value: user.genres?.join(", ") || "Not added yet"
							}),
							/* @__PURE__ */ jsx(Detail, {
								icon: /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4" }),
								label: "Member since",
								value: user.joined
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
								children: user.bio || "No store bio added yet."
							}),
							user.sellerState && /* @__PURE__ */ jsxs("p", {
								className: "mt-3 text-xs text-muted-foreground",
								children: ["Seller status: ", user.sellerState]
							})
						]
					})
				]
			})
		]
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
