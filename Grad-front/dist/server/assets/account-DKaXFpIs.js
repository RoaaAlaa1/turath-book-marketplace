import { i as Button, m as apiFetch, p as useTurath, r as Badge, t as BranchDivider } from "./Ornaments-JhP4ydzQ.js";
import { n as Input, t as Label } from "./label-Qb1MoFXK.js";
import { a as DialogHeader, c as Textarea, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, s as DialogTrigger, t as Dialog } from "./dialog-BnIQQ4q4.js";
import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { BookOpen, LogOut, MapPin, Pencil, Phone, Plus, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
//#region src/routes/account.tsx?tsr-split=component
function Account() {
	const { activeUser, isAuthenticated, updateProfile, syncCurrentUserProfile, signOut } = useTurath();
	const [editOpen, setEditOpen] = useState(false);
	const [ticketModalOpen, setTicketModalOpen] = useState(false);
	const [ticketSubject, setTicketSubject] = useState("");
	const [ticketMessage, setTicketMessage] = useState("");
	const [ticketOrderId, setTicketOrderId] = useState("");
	const [myTickets, setMyTickets] = useState([]);
	const loadTickets = () => {
		if (!isAuthenticated) return;
		apiFetch("/api/support-tickets").then((tickets) => setMyTickets(tickets)).catch(() => setMyTickets([]));
	};
	useEffect(() => {
		if (isAuthenticated) {
			syncCurrentUserProfile();
			loadTickets();
		}
	}, [isAuthenticated, syncCurrentUserProfile]);
	const handleSubmitTicket = async () => {
		if (!ticketSubject.trim() || !ticketMessage.trim()) return;
		try {
			await apiFetch("/api/support-tickets", {
				method: "POST",
				body: JSON.stringify({
					subject: ticketSubject.trim(),
					message: ticketMessage.trim(),
					orderId: ticketOrderId.trim() ? ticketOrderId.trim() : void 0
				})
			});
			toast.success("Support ticket submitted. A steward will respond shortly.");
			setTicketSubject("");
			setTicketMessage("");
			setTicketOrderId("");
			setTicketModalOpen(false);
			loadTickets();
		} catch (error) {
			toast.error("Failed to submit support ticket.");
		}
	};
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
	const [editName, setEditName] = useState(user.name);
	const [editPhone, setEditPhone] = useState(user.phone ?? "");
	const [editAddress, setEditAddress] = useState(user.address ?? "");
	const [editGenres, setEditGenres] = useState(user.genres?.join(", ") ?? "");
	const [editStoreName, setEditStoreName] = useState(user.storeName ?? "");
	const [editBio, setEditBio] = useState(user.bio ?? "");
	const isSeller = user.role === "seller" || user.sellerState === "approved";
	const roleBadgeText = user.role === "admin" ? "Admin" : isSeller ? "Seller" : "Customer";
	const sellerRequestPending = user.sellerState === "pending";
	const displayName = isAuthenticated ? user.name : "Guest Reader";
	const displayEmail = isAuthenticated ? user.email : "guest@example.com";
	const openEditModal = () => {
		setEditName(user.name);
		setEditPhone(user.phone ?? "");
		setEditAddress(user.address ?? "");
		setEditGenres(user.genres?.join(", ") ?? "");
		setEditStoreName(user.storeName ?? "");
		setEditBio(user.bio ?? "");
		setEditOpen(true);
	};
	const handleSaveProfile = () => {
		if (!isAuthenticated || !activeUser) return;
		updateProfile(activeUser.id, {
			name: editName.trim() || activeUser.name,
			phone: editPhone.trim() || void 0,
			address: editAddress.trim() || void 0,
			genres: editGenres.split(",").map((g) => g.trim()).filter(Boolean),
			...isSeller ? {
				storeName: editStoreName.trim() || void 0,
				bio: editBio.trim() || void 0
			} : {}
		});
		setEditOpen(false);
		toast.success("Account details saved successfully.");
	};
	const handleSellerRequest = async () => {
		if (!isAuthenticated || !activeUser) {
			toast.error("Sign in first to request seller access.");
			return;
		}
		try {
			const data = await apiFetch("/api/SellerRequests/apply", {
				method: "POST",
				body: JSON.stringify({
					userId: activeUser.id,
					email: activeUser.email
				})
			});
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
						className: "flex flex-wrap items-start justify-between gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
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
											children: roleBadgeText
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
						}), isAuthenticated && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ jsxs(Dialog, {
								open: editOpen,
								onOpenChange: setEditOpen,
								children: [/* @__PURE__ */ jsx(DialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ jsxs(Button, {
										variant: "outline",
										size: "sm",
										onClick: openEditModal,
										className: "gap-1.5",
										children: [/* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }), "Edit Profile"]
									})
								}), /* @__PURE__ */ jsxs(DialogContent, {
									className: "sm:max-w-[425px]",
									children: [
										/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Edit Profile Details" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Update your contact number, delivery address, and preferences." })] }),
										/* @__PURE__ */ jsxs("div", {
											className: "grid gap-3.5 py-3",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "name",
														children: "Full Name"
													}), /* @__PURE__ */ jsx(Input, {
														id: "name",
														value: editName,
														onChange: (e) => setEditName(e.target.value)
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "phone",
														children: "Phone Number"
													}), /* @__PURE__ */ jsx(Input, {
														id: "phone",
														value: editPhone,
														onChange: (e) => setEditPhone(e.target.value),
														placeholder: "e.g. 01012345678"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "address",
														children: isSeller ? "Store Location" : "Default Shipping Address"
													}), /* @__PURE__ */ jsx(Input, {
														id: "address",
														value: editAddress,
														onChange: (e) => setEditAddress(e.target.value),
														placeholder: "e.g. 12 Al-Mu'izz St, Cairo"
													})]
												}),
												!isSeller ? /* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "genres",
														children: "Preferred Genres"
													}), /* @__PURE__ */ jsx(Input, {
														id: "genres",
														value: editGenres,
														onChange: (e) => setEditGenres(e.target.value),
														placeholder: "e.g. Fiction, History, Philosophy"
													})]
												}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "storeName",
														children: "Store Display Name"
													}), /* @__PURE__ */ jsx(Input, {
														id: "storeName",
														value: editStoreName,
														onChange: (e) => setEditStoreName(e.target.value)
													})]
												}), /* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "bio",
														children: "Store Bio"
													}), /* @__PURE__ */ jsx(Textarea, {
														id: "bio",
														value: editBio,
														onChange: (e) => setEditBio(e.target.value),
														rows: 3
													})]
												})] })
											]
										}),
										/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
											variant: "outline",
											onClick: () => setEditOpen(false),
											children: "Cancel"
										}), /* @__PURE__ */ jsx(Button, {
											onClick: handleSaveProfile,
											children: "Save Changes"
										})] })
									]
								})]
							}), /* @__PURE__ */ jsxs(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									signOut();
									toast.success("Signed out successfully");
								},
								className: "gap-1.5 text-muted-foreground hover:text-destructive",
								children: [/* @__PURE__ */ jsx(LogOut, { className: "h-3.5 w-3.5" }), "Sign Out"]
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
			}),
			isAuthenticated && /* @__PURE__ */ jsxs("section", {
				className: "mt-8 rounded-lg border bg-card p-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-display text-xl tracking-wide",
							children: "Customer Support"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: "Need help with an order, delivery, or book inquiry? Submit a ticket."
						})] }), /* @__PURE__ */ jsxs(Button, {
							size: "sm",
							onClick: () => setTicketModalOpen(true),
							className: "gap-1.5",
							children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " New Ticket"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 space-y-3",
						children: [myTickets.map((t) => /* @__PURE__ */ jsxs("div", {
							className: "rounded-lg border bg-background p-4 shadow-sm",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-sm",
											children: t.subject
										}), /* @__PURE__ */ jsx(Badge, {
											variant: t.adminResponse ? "secondary" : "outline",
											className: t.adminResponse ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900",
											children: t.adminResponse ? "Resolved" : "Under Review"
										})]
									}), /* @__PURE__ */ jsx("span", {
										className: "text-xs text-muted-foreground",
										children: new Date(t.createdAt).toLocaleDateString()
									})]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: t.message
								}),
								t.adminResponse && /* @__PURE__ */ jsxs("div", {
									className: "mt-3 rounded border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-semibold",
										children: "Steward Response:"
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-1",
										children: t.adminResponse
									})]
								})
							]
						}, t.id)), !myTickets.length && /* @__PURE__ */ jsx("p", {
							className: "text-center py-6 text-sm text-muted-foreground",
							children: "You have no open support tickets."
						})]
					}),
					/* @__PURE__ */ jsx(Dialog, {
						open: ticketModalOpen,
						onOpenChange: setTicketModalOpen,
						children: /* @__PURE__ */ jsxs(DialogContent, {
							className: "sm:max-w-md",
							children: [
								/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "Submit Support Ticket" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Send a message to our stewards. We will respond directly to your ticket." })] }),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-3.5 py-3",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "t-subject",
												children: "Subject"
											}), /* @__PURE__ */ jsx(Input, {
												id: "t-subject",
												value: ticketSubject,
												onChange: (e) => setTicketSubject(e.target.value),
												placeholder: "e.g. Question regarding delivery time"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "t-order",
												children: "Order ID (optional)"
											}), /* @__PURE__ */ jsx(Input, {
												id: "t-order",
												value: ticketOrderId,
												onChange: (e) => setTicketOrderId(e.target.value),
												placeholder: "e.g. ord-12345"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "t-msg",
												children: "Message"
											}), /* @__PURE__ */ jsx(Textarea, {
												id: "t-msg",
												rows: 4,
												value: ticketMessage,
												onChange: (e) => setTicketMessage(e.target.value),
												placeholder: "Describe what you need assistance with..."
											})]
										})
									]
								}),
								/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
									variant: "outline",
									onClick: () => setTicketModalOpen(false),
									children: "Cancel"
								}), /* @__PURE__ */ jsx(Button, {
									onClick: handleSubmitTicket,
									disabled: !ticketSubject.trim() || !ticketMessage.trim(),
									children: "Submit Ticket"
								})] })
							]
						})
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
