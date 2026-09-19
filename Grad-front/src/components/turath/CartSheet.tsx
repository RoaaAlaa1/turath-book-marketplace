import { useEffect, useState } from "react";
import { Check, CreditCard, Lock, Mail, Minus, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BookCover } from "./BookCover";
import { SHIPPING, TAX_RATE, egp, useTurath } from "@/lib/turath/store";
import type { Book, CartItem } from "@/lib/turath/types";

type Step = 0 | 1 | 2 | 3 | 4;
type Line = { item: CartItem; book: Book };

export function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { cart, bookById, activeUser, isAuthenticated, setCartQty, removeFromCart, placeOrder } = useTurath();
  const customer = activeUser ?? { name: "Guest", email: "", address: "" };
  const [step, setStep] = useState<Step>(0);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"card" | "cash">("card");
  const [cardholder, setCardholder] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  const lines: Line[] = cart.flatMap((item) => {
    const book = bookById(item.bookId);
    return book ? [{ item, book }] : [];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.book.price * line.item.quantity, 0);
  const shipping = lines.length ? (delivery === "express" ? SHIPPING + 45 : SHIPPING) : 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;
  const cardDigits = card.replace(/\D/g, "");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = emailPattern.test(confirmEmail.trim());
  const shippingValid = address.trim().length >= 6 && city.trim().length >= 2 && emailValid;
  const cardValid = cardDigits.length === 16 && cardholder.trim().length >= 2 && /^\d{2}\/\d{2}$/.test(expiry) && cvv.length === 3;

  useEffect(() => {
    if (!open || address || !customer.address) return;
    const [savedAddress, savedCity] = customer.address.split(",");
    setAddress(savedAddress?.trim() ?? "");
    setCity(savedCity?.trim() ?? "");
  }, [open, address, customer.address]);

  useEffect(() => {
    if (open && isAuthenticated && !confirmEmail) setConfirmEmail(customer.email);
  }, [open, isAuthenticated, customer.email, confirmEmail]);

  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) window.setTimeout(() => { setStep(0); setOrderId(null); setConfirmedTotal(null); setOtp(""); setEmailOpen(false); setConfirmEmail(""); }, 250);
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
      void confirm();
      return;
    }
    setLoading(true);
    window.setTimeout(() => { setLoading(false); setStep(3); }, 900);
  };
  const verify = () => {
    if (otp !== "123456") return toast.error("Verification failed", { description: "Use 123456 for this demo." });
    void confirm();
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="font-display tracking-wide">{step === 0 ? "Your Satchel" : step === 4 ? "Order confirmed" : "Secure checkout"}</SheetTitle>
          <SheetDescription className="font-arabic-display text-base text-primary">أَعْطِ الكُتُبَ حَيَاةً جَدِيدَةً</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {step === 0 && (
            <>
              {!isAuthenticated && lines.length > 0 && <GuestNotice />}
              <CartItems lines={lines} setCartQty={setCartQty} removeFromCart={removeFromCart} />
            </>
          )}
          {step === 1 && <Shipping address={address} setAddress={setAddress} city={city} setCity={setCity} delivery={delivery} setDelivery={setDelivery} userName={customer.name} confirmEmail={confirmEmail} setConfirmEmail={setConfirmEmail} emailValid={emailValid} />}
          {step === 2 && <Payment payment={payment} setPayment={setPayment} cardholder={cardholder} setCardholder={setCardholder} card={card} setCard={setCard} expiry={expiry} setExpiry={setExpiry} cvv={cvv} setCvv={setCvv} />}
          {step === 3 && <SecureOtp otp={otp} setOtp={setOtp} onVerify={verify} />}
          {step === 4 && <Confirmation orderId={orderId} email={customer.email} total={confirmedTotal ?? total} address={`${address}, ${city}`} onEmail={() => setEmailOpen(true)} />}
        </div>
        {step < 4 && lines.length > 0 && <CheckoutFooter step={step} total={total} subtotal={subtotal} shipping={shipping} tax={tax} shippingValid={shippingValid} cardValid={cardValid} loading={loading} payment={payment} isAuthenticated={isAuthenticated} onBack={() => setStep((step - 1) as Step)} onNext={() => setStep((step + 1) as Step)} onPay={pay} onVerify={verify} />}
        {emailOpen && <EmailPreview orderId={orderId} total={confirmedTotal ?? total} address={`${address}, ${city}`} onClose={() => setEmailOpen(false)} />}
      </SheetContent>
    </Sheet>
  );
}

function CartItems({ lines, setCartQty, removeFromCart }: { lines: Line[]; setCartQty: (id: string, quantity: number) => void; removeFromCart: (id: string) => void }) {
  if (!lines.length) return <p className="py-16 text-center text-sm text-muted-foreground">No books yet. Every empty satchel is an invitation.</p>;
  return <ul className="space-y-4">{lines.map(({ item, book }) => <li key={item.bookId} className="flex gap-3"><BookCover book={book} className="h-28 w-20 shrink-0" /><div className="min-w-0 flex-1"><p className="truncate font-serif font-semibold">{book.title}</p><p className="text-xs text-muted-foreground">{book.author}</p><p className="mt-1 text-sm font-medium text-rust">{egp(book.price)}</p><div className="mt-2 flex items-center gap-2"><Button size="icon" variant="outline" className="h-7 w-7" disabled={item.quantity <= 1} onClick={() => setCartQty(item.bookId, item.quantity - 1)} aria-label="Decrease quantity"><Minus className="h-3 w-3" /></Button><span className="w-6 text-center text-sm">{item.quantity}</span><Button size="icon" variant="outline" className="h-7 w-7" disabled={item.quantity >= book.availableQuantity} onClick={() => setCartQty(item.bookId, item.quantity + 1)} aria-label="Increase quantity"><Plus className="h-3 w-3" /></Button><span className="text-xs text-muted-foreground">{book.availableQuantity} in stock</span><Button size="icon" variant="ghost" className="ml-auto h-7 w-7 text-destructive" onClick={() => removeFromCart(item.bookId)} aria-label={`Remove ${book.title}`}><Trash2 className="h-3.5 w-3.5" /></Button></div></div></li>)}</ul>;
}

function Shipping({ address, setAddress, city, setCity, delivery, setDelivery, userName, confirmEmail, setConfirmEmail, emailValid }: any) {
  return <div className="space-y-5"><div><p className="font-display text-lg">1. Order review & shipping</p><p className="text-sm text-muted-foreground">Delivering for {userName}</p></div><Field label="Street address" value={address} onChange={setAddress} placeholder="12 Al-Mu'izz St" /><Field label="City" value={city} onChange={setCity} placeholder="Cairo" /><div className="space-y-1.5"><Label>Confirmation email</Label><Input type="email" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} placeholder="you@example.com" /><p className="text-xs text-muted-foreground">Your order confirmation will be sent to this address.</p>{confirmEmail.trim().length > 0 && !emailValid && <p className="text-xs text-destructive">Enter a valid email address.</p>}</div><div className="space-y-2"><Label>Delivery method</Label><Choice active={delivery === "standard"} onClick={() => setDelivery("standard")} icon={<Truck className="h-4 w-4" />} title="Standard Sustainable Delivery" detail="3-5 days · 35 EGP" /><Choice active={delivery === "express"} onClick={() => setDelivery("express")} icon={<Truck className="h-4 w-4" />} title="Express Courier" detail="1-2 days · 80 EGP" /></div></div>;
}



function GuestNotice() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/30 bg-accent/40 p-3">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="flex-1 text-sm">
        <p className="font-medium">Sign in to place an order</p>
        <p className="text-xs text-muted-foreground">
          We need an account so we know where to send your order confirmation email.
        </p>
        <Button
          size="sm"
          className="mt-2 h-8"
          onClick={() => window.dispatchEvent(new Event("turath:open-auth"))}
        >
          Sign in / Create account
        </Button>
      </div>
    </div>
  );
}

function Payment({ payment, setPayment, cardholder, setCardholder, card, setCard, expiry, setExpiry, cvv, setCvv }: any) {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-lg">2. Payment details</p>
        <p className="text-sm text-muted-foreground">Your payment is simulated locally.</p>
      </div>
      <Choice
        active={payment === "card"}
        onClick={() => setPayment("card")}
        icon={<CreditCard className="h-4 w-4" />}
        title="Credit / Debit Card"
        detail="Visa or Mastercard"
      />
      <Choice
        active={payment === "cash"}
        onClick={() => setPayment("cash")}
        icon={<span className="text-xs">EGP</span>}
        title="Cash on Delivery"
        detail="Pay when your books arrive"
      />
      {payment === "card" && (
        <div className="space-y-3 rounded-lg border bg-card p-3">
          <Field
            label="Cardholder name"
            value={cardholder}
            onChange={setCardholder}
            placeholder="Name on card"
          />
          <Field
            label="Card number"
            value={card}
            onChange={(value: string) =>
              setCard(
                value
                  .replace(/\D/g, "")
                  .replace(/(.{4})/g, "$1 ")
                  .trim()
                  .slice(0, 19)
              )
            }
            placeholder="4242 4242 4242 4242"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Expiry"
              value={expiry}
              onChange={(value: string) =>
                setExpiry(
                  value
                    .replace(/\D/g, "")
                    .replace(/^(\d{2})(\d)/, "$1/$2")
                    .slice(0, 5)
                )
              }
              placeholder="MM/YY"
            />
            <Field
              label="CVV"
              value={cvv}
              onChange={(value: string) =>
                setCvv(value.replace(/\D/g, "").slice(0, 3))
              }
              placeholder="123"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SecureOtp({ otp, setOtp, onVerify }: any) {
  return (
    <div className="space-y-5 py-10 text-center">
      <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
      <p className="font-display text-xl">Verified by Visa</p>
      <p className="text-sm text-muted-foreground">Code sent to +20 10****5678</p>
      <Input
        className="text-center text-xl tracking-[0.4em]"
        maxLength={6}
        inputMode="numeric"
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
        placeholder="123456"
      />
      <p className="text-xs text-muted-foreground">Use 123456 to approve this mock 3D-Secure check.</p>
      <Button variant="outline" className="w-full" onClick={onVerify}>
        Submit code
      </Button>
    </div>
  );
}

function Confirmation({ orderId, email, total, address, onEmail }: any) {
  return (
    <div className="space-y-4 py-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Check className="h-7 w-7" />
      </div>
      <p className="font-display text-xl">Thank you for your order</p>
      <p className="text-sm text-muted-foreground">{orderId} · Estimated arrival in 3-5 days</p>
      <div className="rounded-lg border bg-card p-3 text-left text-sm">
        <Row label="Total" value={egp(total)} strong />
        <p className="mt-2 text-xs text-muted-foreground">Confirmation email sent to {email}</p>
      </div>
      <Button variant="outline" className="w-full" onClick={onEmail}>
        <Mail className="h-4 w-4" /> Preview confirmation email
      </Button>
      <Button asChild className="w-full">
        <Link to="/orders">View order in My Account</Link>
      </Button>
      <p className="text-xs text-muted-foreground">Ships to {address}</p>
    </div>
  );
}

function CheckoutFooter({ step, total, subtotal, shipping, tax, shippingValid, cardValid, loading, payment, isAuthenticated, onBack, onNext, onPay, onVerify }: any) {
  return (
    <div className="space-y-3 border-t bg-card px-4 py-4">
      <div className="space-y-1 text-sm">
        <Row label="Subtotal" value={egp(subtotal)} />
        <Row label="Shipping" value={egp(shipping)} />
        <Row label="Tax (14%)" value={egp(tax)} />
        <Separator className="my-2" />
        <Row label="Total" value={egp(total)} strong />
      </div>
      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
        )}
        {step === 0 && (
          <Button className="flex-1" disabled={!isAuthenticated} onClick={onNext}>
            {isAuthenticated ? "Proceed to checkout" : "Sign in to checkout"}
          </Button>
        )}
        {step === 1 && (
          <Button className="flex-1" disabled={!shippingValid} onClick={onNext}>
            Continue to payment
          </Button>
        )}
        {step === 2 && (
          <Button
            className="flex-1"
            disabled={loading || (payment === "card" && !cardValid)}
            onClick={onPay}
          >
            {loading ? "Connecting securely..." : payment === "card" ? "Pay now" : "Place cash order"}
          </Button>
        )}
        {step === 3 && (
          <Button className="flex-1" onClick={onVerify}>
            Submit verification
          </Button>
        )}
      </div>
    </div>
  );
}

function EmailPreview({ orderId, total, address, onClose }: any) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg">Turath confirmation email</p>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="mt-6 space-y-4 rounded-lg border bg-card p-5 text-sm">
        <p className="font-arabic-display text-2xl text-primary">تراث</p>
        <p>Thank you for giving books a new life.</p>
        <Separator />
        <p><strong>Order:</strong> {orderId}</p>
        <p><strong>Delivery:</strong> {address}</p>
        <p><strong>Total:</strong> {egp(total)}</p>
        <p className="text-muted-foreground">Need help? Reply to this message or visit Turath support.</p>
      </div>
    </div>
  );
}

function Choice({ active, onClick, icon, title, detail }: any) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-md border p-3 text-left ${
        active ? "border-primary bg-accent/50" : "hover:bg-muted"
      }`}
      onClick={onClick}
    >
      <span className="text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{detail}</span>
      </span>
      {active && <Check className="h-4 w-4 text-primary" />}
    </button>
  );
}

function Field({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
