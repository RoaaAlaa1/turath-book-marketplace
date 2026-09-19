import { a as TAX_RATE, c as egp, i as cn, l as roleLabels, o as TurathProvider, r as Badge, t as BranchDivider, u as useTurath } from "./Ornaments-Coe9p7fj.js";
import { t as turath_emblem_default } from "./turath-emblem-CeSt8fKn.js";
import { t as Button } from "./button-wmx3H39q.js";
import { n as Input, t as Label } from "./label-BjU0brKD.js";
import { t as Separator } from "./separator-Bf3wst6q.js";
import { t as BookCover } from "./BookCover-0ywG3LRk.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-ChLIUOL5.js";
import { t as Route$6 } from "./orders-B-Him931.js";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, useRouter } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Check, CreditCard, Heart, KeyRound, Loader2, Lock, LogIn, Mail, MailCheck, Minus, Plus, RotateCcw, Send, ShieldCheck, ShoppingBasket, Trash2, Truck, UserPlus, X } from "lucide-react";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Toaster, toast } from "sonner";
//#region src/styles.css?url
var styles_default = "/assets/styles-BxPimiDB.css";
//#endregion
//#region src/components/ui/sheet.tsx
var Sheet = SheetPrimitive.Root;
var SheetPortal = SheetPrimitive.Portal;
var SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(SheetPrimitive.Content, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ jsxs(SheetPrimitive.Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Title, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
var SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
//#endregion
//#region src/components/turath/CartSheet.tsx
function CartSheet({ open, onOpenChange }) {
	const { cart, bookById, activeUser, isAuthenticated, setCartQty, removeFromCart, placeOrder } = useTurath();
	const customer = activeUser ?? {
		name: "Guest",
		email: "",
		address: ""
	};
	const [step, setStep] = useState(0);
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [confirmEmail, setConfirmEmail] = useState("");
	const [delivery, setDelivery] = useState("standard");
	const [payment, setPayment] = useState("card");
	const [cardholder, setCardholder] = useState("");
	const [card, setCard] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [orderId, setOrderId] = useState(null);
	const [confirmedTotal, setConfirmedTotal] = useState(null);
	const [emailOpen, setEmailOpen] = useState(false);
	const lines = cart.flatMap((item) => {
		const book = bookById(item.bookId);
		return book ? [{
			item,
			book
		}] : [];
	});
	const subtotal = lines.reduce((sum, line) => sum + line.book.price * line.item.quantity, 0);
	const shipping = lines.length ? delivery === "express" ? 80 : 35 : 0;
	const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
	const total = subtotal + shipping + tax;
	const cardDigits = card.replace(/\D/g, "");
	const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmEmail.trim());
	const shippingValid = address.trim().length >= 6 && city.trim().length >= 2 && emailValid;
	const cardValid = cardDigits.length === 16 && cardholder.trim().length >= 2 && /^\d{2}\/\d{2}$/.test(expiry) && cvv.length === 3;
	useEffect(() => {
		if (!open || address || !customer.address) return;
		const [savedAddress, savedCity] = customer.address.split(",");
		setAddress(savedAddress?.trim() ?? "");
		setCity(savedCity?.trim() ?? "");
	}, [
		open,
		address,
		customer.address
	]);
	useEffect(() => {
		if (open && isAuthenticated && !confirmEmail) setConfirmEmail(customer.email);
	}, [
		open,
		isAuthenticated,
		customer.email,
		confirmEmail
	]);
	const close = (nextOpen) => {
		onOpenChange(nextOpen);
		if (!nextOpen) window.setTimeout(() => {
			setStep(0);
			setOrderId(null);
			setConfirmedTotal(null);
			setOtp("");
			setEmailOpen(false);
			setConfirmEmail("");
		}, 250);
	};
	const confirm = async () => {
		const checkoutTotal = total;
		const created = await placeOrder(`${address.trim()}, ${city.trim()}`);
		if (!created) return;
		setOrderId(created);
		setConfirmedTotal(checkoutTotal);
		setStep(4);
		toast.success(`Order ${created} placed`, { description: `Confirmation email sent to ${confirmEmail.trim() || customer.email}` });
	};
	const pay = () => {
		if (payment === "cash") {
			confirm();
			return;
		}
		setLoading(true);
		window.setTimeout(() => {
			setLoading(false);
			setStep(3);
		}, 900);
	};
	const verify = () => {
		if (otp !== "123456") return toast.error("Verification failed", { description: "Use 123456 for this demo." });
		confirm();
	};
	return /* @__PURE__ */ jsx(Sheet, {
		open,
		onOpenChange: close,
		children: /* @__PURE__ */ jsxs(SheetContent, {
			className: "flex w-full flex-col gap-0 p-0 sm:max-w-md",
			children: [
				/* @__PURE__ */ jsxs(SheetHeader, {
					className: "border-b",
					children: [/* @__PURE__ */ jsx(SheetTitle, {
						className: "font-display tracking-wide",
						children: step === 0 ? "Your Satchel" : step === 4 ? "Order confirmed" : "Secure checkout"
					}), /* @__PURE__ */ jsx(SheetDescription, {
						className: "font-arabic-display text-base text-primary",
						children: "أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1 overflow-y-auto px-4 py-4",
					children: [
						step === 0 && /* @__PURE__ */ jsxs(Fragment, { children: [!isAuthenticated && lines.length > 0 && /* @__PURE__ */ jsx(GuestNotice, {}), /* @__PURE__ */ jsx(CartItems, {
							lines,
							setCartQty,
							removeFromCart
						})] }),
						step === 1 && /* @__PURE__ */ jsx(Shipping, {
							address,
							setAddress,
							city,
							setCity,
							delivery,
							setDelivery,
							userName: customer.name,
							confirmEmail,
							setConfirmEmail,
							emailValid
						}),
						step === 2 && /* @__PURE__ */ jsx(Payment, {
							payment,
							setPayment,
							cardholder,
							setCardholder,
							card,
							setCard,
							expiry,
							setExpiry,
							cvv,
							setCvv
						}),
						step === 3 && /* @__PURE__ */ jsx(SecureOtp, {
							otp,
							setOtp,
							onVerify: verify
						}),
						step === 4 && /* @__PURE__ */ jsx(Confirmation, {
							orderId,
							email: customer.email,
							total: confirmedTotal ?? total,
							address: `${address}, ${city}`,
							onEmail: () => setEmailOpen(true)
						})
					]
				}),
				step < 4 && lines.length > 0 && /* @__PURE__ */ jsx(CheckoutFooter, {
					step,
					total,
					subtotal,
					shipping,
					tax,
					shippingValid,
					cardValid,
					loading,
					payment,
					isAuthenticated,
					onBack: () => setStep(step - 1),
					onNext: () => setStep(step + 1),
					onPay: pay,
					onVerify: verify
				}),
				emailOpen && /* @__PURE__ */ jsx(EmailPreview, {
					orderId,
					total: confirmedTotal ?? total,
					address: `${address}, ${city}`,
					onClose: () => setEmailOpen(false)
				})
			]
		})
	});
}
function CartItems({ lines, setCartQty, removeFromCart }) {
	if (!lines.length) return /* @__PURE__ */ jsx("p", {
		className: "py-16 text-center text-sm text-muted-foreground",
		children: "No books yet. Every empty satchel is an invitation."
	});
	return /* @__PURE__ */ jsx("ul", {
		className: "space-y-4",
		children: lines.map(({ item, book }) => /* @__PURE__ */ jsxs("li", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ jsx(BookCover, {
				book,
				className: "h-28 w-20 shrink-0"
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "truncate font-serif font-semibold",
						children: book.title
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: book.author
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm font-medium text-rust",
						children: egp(book.price)
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-2 flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: "outline",
								className: "h-7 w-7",
								disabled: item.quantity <= 1,
								onClick: () => setCartQty(item.bookId, item.quantity - 1),
								"aria-label": "Decrease quantity",
								children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
							}),
							/* @__PURE__ */ jsx("span", {
								className: "w-6 text-center text-sm",
								children: item.quantity
							}),
							/* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: "outline",
								className: "h-7 w-7",
								disabled: item.quantity >= book.availableQuantity,
								onClick: () => setCartQty(item.bookId, item.quantity + 1),
								"aria-label": "Increase quantity",
								children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-muted-foreground",
								children: [book.availableQuantity, " in stock"]
							}),
							/* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: "ghost",
								className: "ml-auto h-7 w-7 text-destructive",
								onClick: () => removeFromCart(item.bookId),
								"aria-label": `Remove ${book.title}`,
								children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
							})
						]
					})
				]
			})]
		}, item.bookId))
	});
}
function Shipping({ address, setAddress, city, setCity, delivery, setDelivery, userName, confirmEmail, setConfirmEmail, emailValid }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "font-display text-lg",
				children: "1. Order review & shipping"
			}), /* @__PURE__ */ jsxs("p", {
				className: "text-sm text-muted-foreground",
				children: ["Delivering for ", userName]
			})] }),
			/* @__PURE__ */ jsx(Field$1, {
				label: "Street address",
				value: address,
				onChange: setAddress,
				placeholder: "12 Al-Mu'izz St"
			}),
			/* @__PURE__ */ jsx(Field$1, {
				label: "City",
				value: city,
				onChange: setCity,
				placeholder: "Cairo"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ jsx(Label, { children: "Confirmation email" }),
					/* @__PURE__ */ jsx(Input, {
						type: "email",
						value: confirmEmail,
						onChange: (event) => setConfirmEmail(event.target.value),
						placeholder: "you@example.com"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: "Your order confirmation will be sent to this address."
					}),
					confirmEmail.trim().length > 0 && !emailValid && /* @__PURE__ */ jsx("p", {
						className: "text-xs text-destructive",
						children: "Enter a valid email address."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ jsx(Label, { children: "Delivery method" }),
					/* @__PURE__ */ jsx(Choice, {
						active: delivery === "standard",
						onClick: () => setDelivery("standard"),
						icon: /* @__PURE__ */ jsx(Truck, { className: "h-4 w-4" }),
						title: "Standard Sustainable Delivery",
						detail: "3-5 days · 35 EGP"
					}),
					/* @__PURE__ */ jsx(Choice, {
						active: delivery === "express",
						onClick: () => setDelivery("express"),
						icon: /* @__PURE__ */ jsx(Truck, { className: "h-4 w-4" }),
						title: "Express Courier",
						detail: "1-2 days · 80 EGP"
					})
				]
			})
		]
	});
}
function GuestNotice() {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-accent/40 p-3",
		children: [/* @__PURE__ */ jsx(Lock, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }), /* @__PURE__ */ jsxs("div", {
			className: "flex-1 text-sm",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "font-medium",
					children: "Sign in to place an order"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: "We need an account so we know where to send your order confirmation email."
				}),
				/* @__PURE__ */ jsx(Button, {
					size: "sm",
					className: "mt-2 h-8",
					onClick: () => window.dispatchEvent(new Event("turath:open-auth")),
					children: "Sign in / Create account"
				})
			]
		})]
	});
}
function Payment({ payment, setPayment, cardholder, setCardholder, card, setCard, expiry, setExpiry, cvv, setCvv }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "font-display text-lg",
				children: "2. Payment details"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: "Your payment is simulated locally."
			})] }),
			/* @__PURE__ */ jsx(Choice, {
				active: payment === "card",
				onClick: () => setPayment("card"),
				icon: /* @__PURE__ */ jsx(CreditCard, { className: "h-4 w-4" }),
				title: "Credit / Debit Card",
				detail: "Visa or Mastercard"
			}),
			/* @__PURE__ */ jsx(Choice, {
				active: payment === "cash",
				onClick: () => setPayment("cash"),
				icon: /* @__PURE__ */ jsx("span", {
					className: "text-xs",
					children: "EGP"
				}),
				title: "Cash on Delivery",
				detail: "Pay when your books arrive"
			}),
			payment === "card" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-3 rounded-lg border bg-card p-3",
				children: [
					/* @__PURE__ */ jsx(Field$1, {
						label: "Cardholder name",
						value: cardholder,
						onChange: setCardholder,
						placeholder: "Roaa Alaa"
					}),
					/* @__PURE__ */ jsx(Field$1, {
						label: "Card number",
						value: card,
						onChange: (value) => setCard(value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19)),
						placeholder: "4242 4242 4242 4242"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsx(Field$1, {
							label: "Expiry",
							value: expiry,
							onChange: (value) => setExpiry(value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5)),
							placeholder: "MM/YY"
						}), /* @__PURE__ */ jsx(Field$1, {
							label: "CVV",
							value: cvv,
							onChange: (value) => setCvv(value.replace(/\D/g, "").slice(0, 3)),
							placeholder: "123"
						})]
					})
				]
			})
		]
	});
}
function SecureOtp({ otp, setOtp, onVerify }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5 py-10 text-center",
		children: [
			/* @__PURE__ */ jsx(ShieldCheck, { className: "mx-auto h-12 w-12 text-primary" }),
			/* @__PURE__ */ jsx("p", {
				className: "font-display text-xl",
				children: "Verified by Visa"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: "Code sent to +20 10****5678"
			}),
			/* @__PURE__ */ jsx(Input, {
				className: "text-center text-xl tracking-[0.4em]",
				maxLength: 6,
				inputMode: "numeric",
				value: otp,
				onChange: (event) => setOtp(event.target.value.replace(/\D/g, "")),
				placeholder: "123456"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-xs text-muted-foreground",
				children: "Use 123456 to approve this mock 3D-Secure check."
			}),
			/* @__PURE__ */ jsx(Button, {
				variant: "outline",
				className: "w-full",
				onClick: onVerify,
				children: "Submit code"
			})
		]
	});
}
function Confirmation({ orderId, email, total, address, onEmail }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4 py-8 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground",
				children: /* @__PURE__ */ jsx(Check, { className: "h-7 w-7" })
			}),
			/* @__PURE__ */ jsx("p", {
				className: "font-display text-xl",
				children: "Thank you for your order"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-sm text-muted-foreground",
				children: [orderId, " · Estimated arrival in 3-5 days"]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border bg-card p-3 text-left text-sm",
				children: [/* @__PURE__ */ jsx(Row, {
					label: "Total",
					value: egp(total),
					strong: true
				}), /* @__PURE__ */ jsxs("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: ["Confirmation email sent to ", email]
				})]
			}),
			/* @__PURE__ */ jsxs(Button, {
				variant: "outline",
				className: "w-full",
				onClick: onEmail,
				children: [/* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }), " Preview confirmation email"]
			}),
			/* @__PURE__ */ jsx(Button, {
				asChild: true,
				className: "w-full",
				children: /* @__PURE__ */ jsx(Link, {
					to: "/orders",
					children: "View order in My Account"
				})
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-xs text-muted-foreground",
				children: ["Ships to ", address]
			})
		]
	});
}
function CheckoutFooter({ step, total, subtotal, shipping, tax, shippingValid, cardValid, loading, payment, isAuthenticated, onBack, onNext, onPay, onVerify }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3 border-t bg-card px-4 py-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "space-y-1 text-sm",
			children: [
				/* @__PURE__ */ jsx(Row, {
					label: "Subtotal",
					value: egp(subtotal)
				}),
				/* @__PURE__ */ jsx(Row, {
					label: "Shipping",
					value: egp(shipping)
				}),
				/* @__PURE__ */ jsx(Row, {
					label: "Tax (14%)",
					value: egp(tax)
				}),
				/* @__PURE__ */ jsx(Separator, { className: "my-2" }),
				/* @__PURE__ */ jsx(Row, {
					label: "Total",
					value: egp(total),
					strong: true
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex gap-2",
			children: [
				step > 0 && /* @__PURE__ */ jsx(Button, {
					variant: "outline",
					className: "flex-1",
					onClick: onBack,
					children: "Back"
				}),
				step === 0 && /* @__PURE__ */ jsx(Button, {
					className: "flex-1",
					disabled: !isAuthenticated,
					onClick: onNext,
					children: isAuthenticated ? "Proceed to checkout" : "Sign in to checkout"
				}),
				step === 1 && /* @__PURE__ */ jsx(Button, {
					className: "flex-1",
					disabled: !shippingValid,
					onClick: onNext,
					children: "Continue to payment"
				}),
				step === 2 && /* @__PURE__ */ jsx(Button, {
					className: "flex-1",
					disabled: loading || payment === "card" && !cardValid,
					onClick: onPay,
					children: loading ? "Connecting securely..." : payment === "card" ? "Pay now" : "Place cash order"
				}),
				step === 3 && /* @__PURE__ */ jsx(Button, {
					className: "flex-1",
					onClick: onVerify,
					children: "Submit verification"
				})
			]
		})]
	});
}
function EmailPreview({ orderId, total, address, onClose }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "absolute inset-0 z-10 overflow-y-auto bg-background p-5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("p", {
				className: "font-display text-lg",
				children: "Turath confirmation email"
			}), /* @__PURE__ */ jsx(Button, {
				size: "sm",
				variant: "ghost",
				onClick: onClose,
				children: "Close"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-6 space-y-4 rounded-lg border bg-card p-5 text-sm",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "font-arabic-display text-2xl text-primary",
					children: "تراث"
				}),
				/* @__PURE__ */ jsx("p", { children: "Thank you for giving books a new life." }),
				/* @__PURE__ */ jsx(Separator, {}),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Order:" }),
					" ",
					orderId
				] }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Delivery:" }),
					" ",
					address
				] }),
				/* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Total:" }),
					" ",
					egp(total)
				] }),
				/* @__PURE__ */ jsx("p", {
					className: "text-muted-foreground",
					children: "Need help? Reply to this message or visit Turath support."
				})
			]
		})]
	});
}
function Choice({ active, onClick, icon, title, detail }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: `flex w-full items-center gap-3 rounded-md border p-3 text-left ${active ? "border-primary bg-accent/50" : "hover:bg-muted"}`,
		onClick,
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "text-primary",
				children: icon
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "flex-1",
				children: [/* @__PURE__ */ jsx("span", {
					className: "block text-sm font-medium",
					children: title
				}), /* @__PURE__ */ jsx("span", {
					className: "block text-xs text-muted-foreground",
					children: detail
				})]
			}),
			active && /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-primary" })
		]
	});
}
function Field$1({ label, value, onChange, placeholder }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, { children: label }), /* @__PURE__ */ jsx(Input, {
			value,
			onChange: (event) => onChange(event.target.value),
			placeholder
		})]
	});
}
function Row({ label, value, strong }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `flex justify-between ${strong ? "font-semibold" : "text-muted-foreground"}`,
		children: [/* @__PURE__ */ jsx("span", { children: label }), /* @__PURE__ */ jsx("span", { children: value })]
	});
}
//#endregion
//#region src/components/turath/ChatWidget.tsx
function ChatWidget() {
	const { isAuthenticated, activeUser } = useTurath();
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState([{
		id: "welcome",
		from: "bot",
		text: "Salam! I'm Jalis, your Turath reading companion. Tell me what kind of books, authors, or genres you enjoy, and I'll find recommendations from our catalog."
	}]);
	const scrollRef = useRef(null);
	useEffect(() => {
		if (open) scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [
		messages,
		open,
		loading
	]);
	const send = async () => {
		const text = input.trim();
		if (!text || loading) return;
		const userMsg = {
			id: `u-${Date.now()}`,
			from: "user",
			text
		};
		setInput("");
		setMessages((prev) => [...prev, userMsg]);
		setLoading(true);
		try {
			const apiBaseUrl = "".replace(/\/$/, "");
			const response = await fetch(`${apiBaseUrl}/api/chatbot/message`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}
				},
				body: JSON.stringify({ message: text })
			});
			if (!response.ok) throw new Error("Failed to fetch recommendation");
			const data = await response.json();
			const botReply = data.reply || data.message || "I couldn't find a matching recommendation right now.";
			setMessages((prev) => [...prev, {
				id: `b-${Date.now()}`,
				from: "bot",
				text: botReply
			}]);
		} catch (error) {
			setMessages((prev) => [...prev, {
				id: `b-${Date.now()}`,
				from: "bot",
				text: "Sorry, I'm having trouble searching the catalog right now. Please try again in a moment."
			}]);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
		type: "button",
		"aria-label": open ? "Close Jalis" : "Open Jalis book assistant",
		onClick: () => setOpen((o) => !o),
		className: "fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full p-0 shadow-lg",
		children: open ? /* @__PURE__ */ jsx(X, { className: "h-6 w-6" }) : /* @__PURE__ */ jsx(BookOpen, { className: "h-6 w-6" })
	}), open && /* @__PURE__ */ jsxs("div", {
		className: "fixed bottom-24 right-5 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "border-b bg-accent/40 px-4 py-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ jsx("p", {
						className: "font-display text-sm tracking-wide",
						children: "Jalis — Book Companion"
					})]
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: isAuthenticated ? `Curated picks for ${activeUser.name}` : "Discover your next read"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				ref: scrollRef,
				className: "flex-1 space-y-2 overflow-y-auto px-3 py-3",
				children: [messages.map((m) => /* @__PURE__ */ jsx("div", {
					className: `max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${m.from === "bot" ? "bg-muted text-foreground" : "ml-auto bg-primary text-primary-foreground"}`,
					children: m.text
				}, m.id)), loading && /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 bg-muted text-muted-foreground max-w-[85%] rounded-lg px-3 py-2 text-xs",
					children: [/* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "Jalis is searching the catalog..." })]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 border-t p-2",
				children: [/* @__PURE__ */ jsx(Input, {
					value: input,
					onChange: (e) => setInput(e.target.value),
					onKeyDown: (e) => e.key === "Enter" && send(),
					placeholder: "Ask Jalis for a book recommendation...",
					disabled: loading,
					className: "h-9"
				}), /* @__PURE__ */ jsx(Button, {
					size: "icon",
					className: "h-9 w-9 shrink-0",
					onClick: send,
					disabled: loading || !input.trim(),
					"aria-label": "Send message",
					children: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" })
				})]
			})
		]
	})] });
}
//#endregion
//#region src/components/turath/AuthSheet.tsx
function AuthSheet({ open, onOpenChange }) {
	const { activeUser, isAuthenticated, registerUser, signIn, signOut } = useTurath();
	const [mode, setMode] = useState("signin");
	const [signUpStep, setSignUpStep] = useState(1);
	const [forgotStep, setForgotStep] = useState(1);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("customer");
	const [phone, setPhone] = useState("");
	const [genres, setGenres] = useState("");
	const [address, setAddress] = useState("");
	const [storeName, setStoreName] = useState("");
	const [bio, setBio] = useState("");
	const [code, setCode] = useState("");
	const [resetPassword, setResetPassword] = useState("");
	const [resetConfirm, setResetConfirm] = useState("");
	const [remember, setRemember] = useState(true);
	const [seconds, setSeconds] = useState(45);
	const [error, setError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [codeError, setCodeError] = useState("");
	useEffect(() => {
		if (!open || seconds <= 0) return;
		const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1e3);
		return () => window.clearTimeout(timer);
	}, [open, seconds]);
	const reset = (nextMode) => {
		setMode(nextMode);
		setSignUpStep(1);
		setForgotStep(1);
		setCode("");
		setError("");
		setPasswordError("");
		setCodeError("");
		setSeconds(45);
	};
	const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	const passwordStrong = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);
	const passwordViolations = password ? [
		password.length >= 8 ? "" : "Use at least 8 characters",
		/[a-z]/.test(password) ? "" : "Add at least one lowercase letter",
		/[A-Z]/.test(password) ? "" : "Add at least one uppercase letter",
		/[^A-Za-z0-9]/.test(password) ? "" : "Add at least one special character"
	].filter(Boolean) : [];
	const profileValid = phone.trim().length >= 8 && (role === "customer" ? address.trim().length >= 6 : storeName.trim().length >= 2);
	const handleSheetOpenChange = (nextOpen) => {
		if (!nextOpen && signUpStep === 3) {
			setMode("signin");
			setSignUpStep(1);
			setCode("");
			setError("");
			setPasswordError("");
			setCodeError("");
			onOpenChange(false);
			window.location.href = "/";
			return;
		}
		onOpenChange(nextOpen);
	};
	const register = async () => {
		const fullName = name.trim();
		const parts = fullName.split(/\s+/).filter(Boolean);
		const firstName = parts[0] ?? "";
		const lastName = parts.slice(1).join(" ") || "User";
		const apiBaseUrl = "".replace(/\/$/, "");
		try {
			const response = await fetch(`${apiBaseUrl}/api/Auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName,
					lastName,
					email: email.trim(),
					password
				})
			});
			const data = await response.json();
			if (!response.ok) {
				const errorMessages = Array.isArray(data?.errors) ? data.errors.map((item) => item?.description ?? item).join(". ") : typeof data?.errors === "object" ? Object.values(data.errors).flat().join(". ") : data?.message || data?.title || "Registration failed.";
				throw new Error(errorMessages);
			}
			if (data?.token) localStorage.setItem("token", data.token);
			if (role === "seller" && data?.token) try {
				await fetch(`${apiBaseUrl}/api/SellerRequests/apply`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${data.token}`
					}
				});
			} catch {}
			registerUser({
				name: fullName,
				email: email.trim(),
				role: role === "seller" ? "seller" : "customer",
				phone: phone.trim(),
				genres: genres.split(",").map((item) => item.trim()).filter(Boolean),
				...role === "seller" ? {
					sellerState: "pending",
					storeName: storeName.trim(),
					bio: bio.trim()
				} : { address: address.trim() }
			});
			setSignUpStep(4);
			toast.success("Your Turath account is ready");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Registration failed.";
			setPasswordError(message);
			setCodeError("");
			setError("");
		}
	};
	const submitSignIn = async () => {
		if (!validEmail || !password) return setError("Enter a valid email and password.");
		const apiBaseUrl = "".replace(/\/$/, "");
		try {
			const response = await fetch(`${apiBaseUrl}/api/Auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim(),
					password
				})
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data?.message || data?.title || "Login failed.");
			if (data?.token) localStorage.setItem("token", data.token);
			const localUserName = data?.username || email.trim().split("@")[0] || "Turath User";
			if (!signIn(email)) registerUser({
				name: localUserName,
				email: email.trim(),
				role: "customer"
			});
			toast.success(remember ? "Signed in and remembered on this device" : "Signed in");
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "We could not find an active account with that email.");
		}
	};
	const submitCode = (next) => {
		if (!code || code.length !== 6 || code !== "123456") return setCodeError("That code is not valid. Use 123456 for this demo.");
		setCodeError("");
		next();
	};
	if (isAuthenticated && mode === "signin") return /* @__PURE__ */ jsx(Sheet, {
		open,
		onOpenChange: handleSheetOpenChange,
		children: /* @__PURE__ */ jsxs(SheetContent, {
			className: "w-full sm:max-w-md",
			children: [/* @__PURE__ */ jsxs(SheetHeader, { children: [/* @__PURE__ */ jsx(SheetTitle, {
				className: "font-display tracking-wide",
				children: "Your Turath account"
			}), /* @__PURE__ */ jsx(SheetDescription, { children: activeUser.email })] }), /* @__PURE__ */ jsxs("div", {
				className: "space-y-5 px-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border bg-card p-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-serif text-xl",
						children: activeUser.name
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: activeUser.address ?? activeUser.storeName ?? "Your account is ready for its next chapter."
					})]
				}), /* @__PURE__ */ jsx(Button, {
					variant: "outline",
					className: "w-full",
					onClick: () => {
						signOut();
						handleSheetOpenChange(false);
						toast.success("Signed out");
					},
					children: "Sign out"
				})]
			})]
		})
	});
	return /* @__PURE__ */ jsx(Sheet, {
		open,
		onOpenChange: handleSheetOpenChange,
		children: /* @__PURE__ */ jsxs(SheetContent, {
			className: "w-full overflow-y-auto sm:max-w-md",
			children: [/* @__PURE__ */ jsxs(SheetHeader, { children: [/* @__PURE__ */ jsx(SheetTitle, {
				className: "font-display tracking-wide",
				children: mode === "signup" ? "Join Turath" : mode === "forgot" ? "Recover your account" : "Welcome back"
			}), /* @__PURE__ */ jsx(SheetDescription, {
				className: "font-arabic-display text-base text-primary",
				children: "أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً"
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 px-4 pb-8",
				children: [
					mode === "signin" && /* @__PURE__ */ jsx(SignIn, {
						email,
						setEmail,
						password,
						setPassword,
						remember,
						setRemember,
						error,
						onSubmit: submitSignIn,
						onForgot: () => reset("forgot"),
						onSignup: () => reset("signup")
					}),
					mode === "signup" && /* @__PURE__ */ jsx(SignUp, {
						step: signUpStep,
						name,
						setName,
						email,
						setEmail,
						password,
						setPassword,
						role,
						setRole,
						phone,
						setPhone,
						genres,
						setGenres,
						address,
						setAddress,
						storeName,
						setStoreName,
						bio,
						setBio,
						code,
						setCode,
						seconds,
						error,
						validEmail,
						passwordStrong,
						profileValid,
						passwordViolations,
						passwordError,
						clearPasswordError: () => setPasswordError(""),
						onNext: () => {
							setError("");
							setSignUpStep(2);
						},
						onProfile: () => {
							setError("");
							setSignUpStep(3);
						},
						onBackFromVerify: () => {
							setError("");
							setSignUpStep(2);
						},
						onVerify: () => submitCode(register),
						onSignin: () => reset("signin")
					}),
					mode === "forgot" && /* @__PURE__ */ jsx(Forgot, {
						step: forgotStep,
						email,
						setEmail,
						code,
						setCode,
						resetPassword,
						setResetPassword,
						resetConfirm,
						setResetConfirm,
						seconds,
						error,
						validEmail,
						onEmail: () => {
							if (!validEmail) return setError("Enter a valid email address.");
							setError("");
							setForgotStep(2);
						},
						onVerify: () => submitCode(() => setForgotStep(3)),
						onReset: () => setForgotStep(4),
						onSignin: () => reset("signin"),
						onBack: () => {
							setError("");
							setForgotStep(1);
						}
					})
				]
			})]
		})
	});
}
function SignIn({ email, setEmail, password, setPassword, remember, setRemember, error, onSubmit, onForgot, onSignup }) {
	return /* @__PURE__ */ jsxs("form", {
		className: "space-y-4",
		onSubmit: (event) => {
			event.preventDefault();
			onSubmit();
		},
		children: [
			/* @__PURE__ */ jsx(Field, {
				label: "Email",
				type: "email",
				value: email,
				onChange: setEmail
			}),
			/* @__PURE__ */ jsx(Field, {
				label: "Password",
				type: "password",
				value: password,
				onChange: setPassword
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ jsx("input", {
					type: "checkbox",
					checked: remember,
					onChange: (event) => setRemember(event.target.checked)
				}), "Remember me"]
			}),
			error && /* @__PURE__ */ jsx(ErrorText, { text: error }),
			/* @__PURE__ */ jsxs(Button, {
				className: "w-full",
				children: [/* @__PURE__ */ jsx(LogIn, { className: "h-4 w-4" }), " Sign in"]
			}),
			/* @__PURE__ */ jsx(Button, {
				type: "button",
				variant: "link",
				className: "w-full",
				onClick: onForgot,
				children: "Forgot password?"
			}),
			/* @__PURE__ */ jsxs(Button, {
				type: "button",
				variant: "outline",
				className: "w-full",
				onClick: onSignup,
				children: [/* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }), " Create an account"]
			})
		]
	});
}
function SignUp(props) {
	const passwordIssueText = props.passwordError || (props.password && props.passwordViolations.length ? props.passwordViolations.join(". ") : "");
	if (props.step === 1) return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(Field, {
				label: "Name",
				value: props.name,
				onChange: props.setName
			}),
			/* @__PURE__ */ jsx(Field, {
				label: "Email",
				type: "email",
				value: props.email,
				onChange: props.setEmail
			}),
			/* @__PURE__ */ jsx(Field, {
				label: "Password",
				type: "password",
				value: props.password,
				onChange: (value) => {
					props.setPassword(value);
					props.clearPasswordError();
				}
			}),
			passwordIssueText && /* @__PURE__ */ jsx(ErrorText, { text: passwordIssueText }),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ jsx(Label, { children: "Account type" }), /* @__PURE__ */ jsxs(Select, {
					value: props.role,
					onValueChange: props.setRole,
					children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsxs(SelectContent, { children: [/* @__PURE__ */ jsx(SelectItem, {
						value: "customer",
						children: "Customer / قارئ"
					}), /* @__PURE__ */ jsx(SelectItem, {
						value: "seller",
						children: "Seller / بائع"
					})] })]
				})]
			}),
			/* @__PURE__ */ jsx(Button, {
				className: "w-full",
				disabled: !props.name.trim() || !props.validEmail || !props.passwordStrong,
				onClick: props.onNext,
				children: "Continue"
			}),
			/* @__PURE__ */ jsx(Button, {
				variant: "link",
				className: "w-full",
				onClick: props.onSignin,
				children: "Already have an account?"
			})
		]
	});
	if (props.step === 2) return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(Field, {
				label: "Phone number",
				value: props.phone,
				onChange: props.setPhone
			}),
			/* @__PURE__ */ jsx(Field, {
				label: "Preferred genres",
				value: props.genres,
				onChange: props.setGenres,
				placeholder: "Fiction, Philosophy"
			}),
			props.role === "customer" ? /* @__PURE__ */ jsx(Field, {
				label: "Default shipping address",
				value: props.address,
				onChange: props.setAddress
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Field, {
				label: "Store display name",
				value: props.storeName,
				onChange: props.setStoreName
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ jsx(Label, { children: "Store bio" }), /* @__PURE__ */ jsx("textarea", {
					className: "border-input bg-transparent w-full rounded-md border px-3 py-2 text-sm",
					value: props.bio,
					onChange: (event) => props.setBio(event.target.value),
					rows: 4
				})]
			})] }),
			/* @__PURE__ */ jsx(Button, {
				className: "w-full",
				disabled: !props.profileValid,
				onClick: props.onProfile,
				children: "Continue to verification"
			})
		]
	});
	if (props.step === 3) return /* @__PURE__ */ jsx(CodeStep, {
		code: props.code,
		setCode: props.setCode,
		seconds: props.seconds,
		error: props.error,
		onSubmit: props.onVerify,
		onBack: props.onBackFromVerify ?? props.onProfile
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4 py-8 text-center",
		children: [
			/* @__PURE__ */ jsx(MailCheck, { className: "mx-auto h-12 w-12 text-primary" }),
			/* @__PURE__ */ jsx("h3", {
				className: "font-display text-xl",
				children: "Signed in successfully"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: "Your Turath account is ready. Sellers will see a pending verification notice until approved."
			}),
			/* @__PURE__ */ jsx(Button, {
				className: "w-full",
				onClick: props.onSignin,
				children: "Done"
			})
		]
	});
}
function Forgot(props) {
	if (props.step === 1) return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(Field, {
				label: "Registered email",
				type: "email",
				value: props.email,
				onChange: props.setEmail
			}),
			props.error && /* @__PURE__ */ jsx(ErrorText, { text: props.error }),
			/* @__PURE__ */ jsx(Button, {
				className: "w-full",
				onClick: props.onEmail,
				children: "Send reset code"
			})
		]
	});
	if (props.step === 2) return /* @__PURE__ */ jsx(CodeStep, {
		code: props.code,
		setCode: props.setCode,
		seconds: props.seconds,
		error: props.error,
		onSubmit: props.onVerify,
		onBack: props.onBack
	});
	if (props.step === 3) return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(Field, {
				label: "New password",
				type: "password",
				value: props.resetPassword,
				onChange: props.setResetPassword
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-xs text-muted-foreground",
				children: ["Strength: ", props.resetPassword.length >= 8 ? "Strong" : "Use at least 8 characters"]
			}),
			/* @__PURE__ */ jsx(Field, {
				label: "Confirm password",
				type: "password",
				value: props.resetConfirm,
				onChange: props.setResetConfirm
			}),
			/* @__PURE__ */ jsx(Button, {
				className: "w-full",
				disabled: props.resetPassword.length < 8 || props.resetPassword !== props.resetConfirm,
				onClick: props.onReset,
				children: "Create new password"
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4 py-8 text-center",
		children: [
			/* @__PURE__ */ jsx(KeyRound, { className: "mx-auto h-12 w-12 text-primary" }),
			/* @__PURE__ */ jsx("h3", {
				className: "font-display text-xl",
				children: "Password updated"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: "Your mock reset is complete."
			}),
			/* @__PURE__ */ jsx(Button, {
				className: "w-full",
				onClick: props.onSignin,
				children: "Sign in with new password"
			})
		]
	});
}
function CodeStep({ code, setCode, seconds, error, onSubmit, onBack }) {
	const fieldError = error || (code.length > 0 && (code.length !== 6 || code !== "123456") ? "That code is not valid. Use 123456 for this demo." : "");
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4 text-center",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsxs(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					className: "h-8 px-2",
					onClick: onBack,
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }), " Back"]
				}), /* @__PURE__ */ jsx("div", { className: "flex-1" })]
			}),
			/* @__PURE__ */ jsx(MailCheck, { className: "mx-auto h-10 w-10 text-primary" }),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: "Enter the 6-digit code sent to your email."
			}),
			/* @__PURE__ */ jsx(Input, {
				className: "text-center text-xl tracking-[0.4em]",
				inputMode: "numeric",
				maxLength: 6,
				value: code,
				onChange: (event) => setCode(event.target.value.replace(/\D/g, "")),
				placeholder: "123456"
			}),
			fieldError && /* @__PURE__ */ jsx(ErrorText, { text: fieldError }),
			/* @__PURE__ */ jsxs("p", {
				className: "text-xs text-muted-foreground",
				children: ["Use 123456 to test · ", seconds > 0 ? `Resend code in ${seconds}s` : "You can resend now"]
			}),
			/* @__PURE__ */ jsx(Button, {
				className: "w-full",
				onClick: onSubmit,
				children: "Verify code"
			})
		]
	});
}
function Field({ label, value, onChange, type = "text", placeholder }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, { children: label }), /* @__PURE__ */ jsx(Input, {
			type,
			value,
			placeholder,
			onChange: (event) => onChange(event.target.value)
		})]
	});
}
function ErrorText({ text }) {
	return /* @__PURE__ */ jsx("p", {
		className: "text-xs text-destructive",
		children: text
	});
}
function AuthBadge({ onClick }) {
	const { activeUser, isAuthenticated } = useTurath();
	return /* @__PURE__ */ jsxs(Button, {
		variant: "ghost",
		className: "hidden max-w-[170px] items-center gap-2 px-2 sm:flex",
		onClick,
		children: [/* @__PURE__ */ jsx("span", {
			className: "flex h-7 w-7 items-center justify-center rounded-full bg-accent font-serif text-sm text-accent-foreground",
			children: isAuthenticated ? activeUser.name.charAt(0).toUpperCase() : "J"
		}), /* @__PURE__ */ jsx("span", {
			className: "truncate text-xs",
			children: isAuthenticated ? activeUser.name : "Join us"
		})]
	});
}
//#endregion
//#region src/components/turath/Layout.tsx
var navFor = {
	customer: [
		{
			to: "/",
			label: "Home"
		},
		{
			to: "/shop",
			label: "Shop"
		},
		{
			to: "/account",
			label: "Account"
		}
	],
	seller: [
		{
			to: "/",
			label: "Home"
		},
		{
			to: "/shop",
			label: "Shop"
		},
		{
			to: "/seller",
			label: "Seller Portal"
		},
		{
			to: "/account",
			label: "Account"
		}
	],
	pendingSeller: [
		{
			to: "/",
			label: "Home"
		},
		{
			to: "/shop",
			label: "Shop"
		},
		{
			to: "/account",
			label: "Account"
		}
	],
	admin: [
		{
			to: "/",
			label: "Home"
		},
		{
			to: "/shop",
			label: "Shop"
		},
		{
			to: "/account",
			label: "Account"
		}
	]
};
function Layout({ children }) {
	const { role, isAuthenticated, cart, wishlist, bookById, toggleWishlist, resetAll, activeUser } = useTurath();
	const [cartOpen, setCartOpen] = useState(false);
	const [wishOpen, setWishOpen] = useState(false);
	const [authOpen, setAuthOpen] = useState(false);
	const safeRole = activeUser?.sellerState === "pending" ? "customer" : role ?? "customer";
	const safeCart = Array.isArray(cart) ? cart : [];
	const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
	useEffect(() => {
		const openAuth = () => setAuthOpen(true);
		window.addEventListener("turath:open-auth", openAuth);
		return () => window.removeEventListener("turath:open-auth", openAuth);
	}, []);
	const cartCount = safeCart.reduce((s, c) => s + (Number(c?.quantity) || 0), 0);
	const navigation = safeRole === "customer" && isAuthenticated ? [
		...navFor[safeRole].slice(0, 2),
		{
			to: "/orders",
			label: "My Orders"
		},
		...navFor[safeRole].slice(2)
	] : navFor[safeRole];
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ jsxs(Link, {
							to: "/",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("img", {
								src: turath_emblem_default,
								alt: "",
								width: 1024,
								height: 1024,
								className: "h-10 w-10 object-contain"
							}), /* @__PURE__ */ jsxs("span", {
								className: "leading-none",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block font-display text-lg tracking-[0.2em] uppercase",
									children: "Turath"
								}), /* @__PURE__ */ jsx("span", {
									className: "font-arabic-display block text-sm text-primary",
									children: "تراث"
								})]
							})]
						}),
						/* @__PURE__ */ jsx("nav", {
							className: "order-3 flex w-full gap-1 overflow-x-auto md:order-none md:w-auto md:pl-6",
							children: navigation.map((n) => /* @__PURE__ */ jsx(Link, {
								to: n.to,
								activeOptions: { exact: n.to === "/" },
								activeProps: { className: "bg-accent text-accent-foreground" },
								className: "rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-muted",
								children: n.label
							}, n.to))
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "ml-auto flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx(AuthBadge, { onClick: () => setAuthOpen(true) }),
								/* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Wishlist",
									className: "relative",
									onClick: () => setWishOpen(true),
									children: [/* @__PURE__ */ jsx(Heart, { className: "h-5 w-5" }), safeWishlist.length > 0 && /* @__PURE__ */ jsx(Dot, { children: safeWishlist.length })]
								}),
								/* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Cart",
									className: "relative",
									onClick: () => setCartOpen(true),
									children: [/* @__PURE__ */ jsx(ShoppingBasket, { className: "h-5 w-5" }), cartCount > 0 && /* @__PURE__ */ jsx(Dot, { children: cartCount })]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "mt-16 border-t bg-ivory/60 px-4 py-10",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto max-w-7xl space-y-4 text-center",
					children: [
						/* @__PURE__ */ jsx(BranchDivider, {}),
						/* @__PURE__ */ jsx("p", {
							className: "font-arabic-display text-2xl text-primary",
							children: "أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm text-muted-foreground",
							children: ["Turath · a marketplace for pre-loved and recycled books.", isAuthenticated ? /* @__PURE__ */ jsxs(Fragment, { children: [
								" ",
								"Signed in as ",
								/* @__PURE__ */ jsx("span", {
									className: "font-medium text-foreground",
									children: activeUser.name
								}),
								" (",
								roleLabels[safeRole].en,
								")."
							] }) : /* @__PURE__ */ jsxs(Fragment, { children: [" ", "Join us and start your reading journey."] })]
						}),
						/* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "sm",
							onClick: resetAll,
							children: [/* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }), " Reset demo data"]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(CartSheet, {
				open: cartOpen,
				onOpenChange: setCartOpen
			}),
			/* @__PURE__ */ jsx(AuthSheet, {
				open: authOpen,
				onOpenChange: setAuthOpen
			}),
			/* @__PURE__ */ jsx(Sheet, {
				open: wishOpen,
				onOpenChange: setWishOpen,
				children: /* @__PURE__ */ jsxs(SheetContent, {
					className: "w-full sm:max-w-sm",
					children: [/* @__PURE__ */ jsx(SheetHeader, { children: /* @__PURE__ */ jsx(SheetTitle, {
						className: "font-display tracking-wide",
						children: "Wishlist"
					}) }), /* @__PURE__ */ jsxs("div", {
						className: "space-y-4 overflow-y-auto px-4 pb-6",
						children: [safeWishlist.length === 0 && /* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: "Nothing saved yet."
						}), safeWishlist.map((id) => {
							const b = bookById(id);
							if (!b) return null;
							return /* @__PURE__ */ jsxs("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ jsx(BookCover, {
									book: b,
									className: "h-24 w-16 shrink-0"
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ jsx("p", {
											className: "truncate font-serif font-semibold",
											children: b.title
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs text-muted-foreground",
											children: b.author
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-sm text-rust",
											children: egp(b.price)
										}),
										/* @__PURE__ */ jsx(Button, {
											size: "sm",
											variant: "ghost",
											className: "mt-1 h-7 px-2 text-xs text-destructive",
											onClick: () => toggleWishlist(id),
											children: "Remove"
										})
									]
								})]
							}, id);
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsx(ChatWidget, {})
		]
	});
}
function Dot({ children }) {
	return /* @__PURE__ */ jsx(Badge, {
		className: "absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full bg-rust px-1 text-[0.6rem] text-background",
		children
	});
}
//#endregion
//#region src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ jsx(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$5 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Turath — Pre-loved & Recycled Books" },
			{
				name: "description",
				content: "Turath is a marketplace for pre-loved, recycled and rare books. Give books a new life."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Amiri:wght@400;700&family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400..800;1,400..700&family=Plus+Jakarta+Sans:wght@300..800&display=swap"
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/Grad-front/dist/client/icon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$5.useRouteContext();
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsxs(TurathProvider, { children: [/* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Outlet, {}) }), /* @__PURE__ */ jsx(Toaster$1, { position: "top-center" })] })
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$4 = () => import("./routes-Bq5D0rEN.js");
var Route$4 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Turath تراث — Give Books a New Life" },
		{
			name: "description",
			content: "A sustainable marketplace for pre-loved, recycled and rare books. Discover classics, academic texts and antique editions passed reader to reader."
		},
		{
			property: "og:title",
			content: "Turath تراث — Give Books a New Life"
		},
		{
			property: "og:description",
			content: "A sustainable marketplace for pre-loved, recycled and rare books."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/account.tsx
var $$splitComponentImporter$3 = () => import("./account-DCof4Y7j.js");
var Route$3 = createFileRoute("/account")({
	head: () => ({ meta: [{ title: "My Account — Turath" }, {
		name: "description",
		content: "View your Turath account details and reading preferences."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/admin.tsx
var $$splitComponentImporter$2 = () => import("./admin-BZfCBxdL.js");
var Route$2 = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "Admin Stewardship — Turath" }, {
		name: "description",
		content: "Oversee sellers, books, users, categories and orders on Turath."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/seller.tsx
var $$splitComponentImporter$1 = () => import("./seller-C1Dff0YZ.js");
var Route$1 = createFileRoute("/seller")({
	head: () => ({ meta: [
		{ title: "Seller Portal — Turath" },
		{
			name: "description",
			content: "Manage your pre-loved book inventory, track revenue and fulfil orders on Turath."
		},
		{
			property: "og:title",
			content: "Seller Portal — Turath"
		},
		{
			property: "og:description",
			content: "Manage inventory and fulfil orders on Turath."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/shop.tsx
var $$splitComponentImporter = () => import("./shop-BAFgB6R0.js");
var Route = createFileRoute("/shop")({
	head: () => ({ meta: [
		{ title: "Shop Pre-loved Books — Turath" },
		{
			name: "description",
			content: "Search and filter classic literature, academic texts, rare antiques, fiction, philosophy and children's books, all pre-loved."
		},
		{
			property: "og:title",
			content: "Shop Pre-loved Books — Turath"
		},
		{
			property: "og:description",
			content: "Search, filter and sort second-hand and rare books on Turath."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	AccountRoute: Route$3.update({
		id: "/account",
		path: "/account",
		getParentRoute: () => Route$5
	}),
	AdminRoute: Route$2.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$5
	}),
	OrdersRoute: Route$6.update({
		id: "/orders",
		path: "/orders",
		getParentRoute: () => Route$5
	}),
	SellerRoute: Route$1.update({
		id: "/seller",
		path: "/seller",
		getParentRoute: () => Route$5
	}),
	ShopRoute: Route.update({
		id: "/shop",
		path: "/shop",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
