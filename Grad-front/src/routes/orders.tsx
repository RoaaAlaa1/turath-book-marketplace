import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BranchDivider } from "@/components/turath/Ornaments";
import { egp, useTurath } from "@/lib/turath/store";
import type { OrderStatus } from "@/lib/turath/types";

const timeline: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered"];

export const statusTone: Record<OrderStatus, string> = {
  Pending: "bg-amber-gold/25 text-foreground",
  Confirmed: "bg-navy/15 text-navy",
  Shipped: "bg-sage/25 text-primary",
  Delivered: "bg-primary text-primary-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Turath" },
      { name: "description", content: "Track your Turath book orders from pending to delivered." },
      { property: "og:title", content: "My Orders — Turath" },
      { property: "og:description", content: "Track your Turath book orders." },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { orders, activeUser, cancelOrder } = useTurath();
  const [apiOrders, setApiOrders] = useState<typeof orders>([]);
  const [bookCatalog, setBookCatalog] = useState<Record<string, { title: string; author: string; price: number }>>({});

  useEffect(() => {
    fetch("/api/Books")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const nextMap: Record<string, { title: string; author: string; price: number }> = {};
        for (const item of data ?? []) {
          nextMap[String(item.id)] = {
            title: item.title ?? `Book #${item.id}`,
            author: item.author ?? "",
            price: Number(item.price ?? 0),
          };
        }
        setBookCatalog(nextMap);
      })
      .catch(() => setBookCatalog({}));
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("token")
      ? JSON.parse(
          atob(localStorage.getItem("token")!.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        )?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
      : null;
    if (!userId) return;

    fetch(`/api/Orders/${userId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setApiOrders(
          data.map((o: any) => {
            const lines = (o.orderItems ?? []).map((line: any) => {
              const productId = String(line.productId ?? "");
              const book = bookCatalog[productId] ?? {
                title: `Book #${productId}`,
                author: "",
                price: Number(line.price ?? 0),
              };

              return {
                bookId: productId,
                title: book.title,
                author: book.author,
                price: Number(line.price ?? book.price ?? 0),
                quantity: Number(line.quantity ?? 0),
                sellerId: String(line.sellerId ?? ""),
              };
            });

            return {
              id: String(o.id ?? ""),
              customerId: String(o.customerId ?? userId),
              customerName: o.customerName ?? activeUser.name,
              lines,
              subtotal: Number(o.total ?? 0),
              shipping: 35,
              tax: 0,
              total: Number(o.total ?? 0),
              status: (o.status ?? "Pending") as any,
              placedAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Today",
              address: o.address ?? "",
            };
          }),
        ),
      )
      .catch(() => setApiOrders([]));
  }, [activeUser.name, bookCatalog]);

  const mine = useMemo(() => {
    const list = apiOrders.length ? apiOrders : orders;
    return list.filter((o) => o.customerId === activeUser.id);
  }, [apiOrders, activeUser.id, orders]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-3xl tracking-wide">My Orders</h1>
        <p className="font-arabic-display mt-1 text-xl text-primary">طلباتي</p>
        <BranchDivider className="mt-4" />
      </header>

      {mine.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">No orders yet.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Find a book</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {mine.map((o) => {
          const stage = timeline.indexOf(o.status);
          return (
            <article key={o.id} className="rounded-lg border bg-card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-lg">{o.id}</span>
                <Badge className={statusTone[o.status]}>{o.status}</Badge>
                <span className="text-xs text-muted-foreground">Placed {o.placedAt}</span>
                <span className="ml-auto font-semibold">{egp(o.total)}</span>
              </div>

              <ul className="mt-4 space-y-1 text-sm">
                {o.lines.map((l) => (
                  <li key={l.bookId} className="flex justify-between gap-3">
                    <span>
                      {l.title} <span className="text-muted-foreground">× {l.quantity}</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {egp(l.price * l.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              {o.status === "Cancelled" ? (
                <p className="text-sm text-destructive">This order was cancelled.</p>
              ) : (
                <ol className="flex items-center gap-2" aria-label="Order timeline">
                  {timeline.map((t, i) => (
                    <li key={t} className="flex flex-1 items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`h-3 w-3 rounded-full ${i <= stage ? "bg-primary" : "bg-border"}`}
                        />
                        <span
                          className={`text-[0.65rem] ${i <= stage ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {t}
                        </span>
                      </div>
                      {i < timeline.length - 1 && (
                        <span className={`h-px flex-1 ${i < stage ? "bg-primary" : "bg-border"}`} />
                      )}
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground">Ships to {o.address}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto text-destructive"
                  disabled={o.status !== "Pending"}
                  onClick={() => {
                    cancelOrder(o.id);
                    toast.success(`Order ${o.id} cancelled`);
                  }}
                >
                  Cancel order
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
