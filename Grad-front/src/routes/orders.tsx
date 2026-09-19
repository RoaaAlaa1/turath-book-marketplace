import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BranchDivider } from "@/components/turath/Ornaments";
import { egp, useTurath } from "@/lib/turath/store";
import { apiFetch, currentUserId } from "@/lib/turath/api";
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
  const userId = currentUserId() || activeUser?.id;

  useEffect(() => {
    if (!userId) return;

    apiFetch<any[]>(`/api/Orders`)
      .then((data) => {
        if (!Array.isArray(data)) return;
        setApiOrders(
          data.map((o: any) => {
            const rawItems = o.orderItems ?? o.items ?? o.lines ?? [];
            const lines = rawItems.map((line: any) => {
              const productId = String(line.productId ?? line.bookId ?? "");
              return {
                bookId: productId,
                title: line.title ?? line.bookTitle ?? `Book #${productId}`,
                author: line.author ?? "",
                price: Number(line.unitPrice ?? line.price ?? 0),
                quantity: Number(line.quantity ?? 1),
                sellerId: String(line.sellerId ?? ""),
              };
            });

            return {
              id: String(o.id ?? ""),
              customerId: String(o.customerId ?? userId),
              customerName: o.customerName ?? activeUser?.name ?? "Customer",
              lines,
              subtotal: Number(o.subtotal ?? o.totalPrice ?? o.total ?? 0),
              shipping: Number(o.shipping ?? 35),
              tax: Number(o.tax ?? 0),
              total: Number(o.totalPrice ?? o.total ?? 0),
              status: (o.status ?? "Pending") as any,
              placedAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Today",
              address: o.shippingAddress ?? o.address ?? "",
            };
          }),
        );
      })
      .catch(() => setApiOrders([]));
  }, [userId, activeUser?.name]);

  const mine = useMemo(() => {
    if (!userId) return orders;
    const list = apiOrders.length > 0 ? apiOrders : orders;
    return list.filter((o) => !o.customerId || o.customerId === userId || (activeUser?.id && o.customerId === activeUser.id));
  }, [apiOrders, orders, userId, activeUser?.id]);

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
