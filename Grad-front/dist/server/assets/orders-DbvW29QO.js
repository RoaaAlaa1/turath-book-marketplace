import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
//#region src/routes/orders.tsx
var $$splitComponentImporter = () => import("./orders-Db2SNnKt.js");
var statusTone = {
	Pending: "bg-amber-gold/25 text-foreground",
	Confirmed: "bg-navy/15 text-navy",
	Shipped: "bg-sage/25 text-primary",
	Delivered: "bg-primary text-primary-foreground",
	Cancelled: "bg-destructive/15 text-destructive"
};
var Route = createFileRoute("/orders")({
	head: () => ({ meta: [
		{ title: "My Orders — Turath" },
		{
			name: "description",
			content: "Track your Turath book orders from pending to delivered."
		},
		{
			property: "og:title",
			content: "My Orders — Turath"
		},
		{
			property: "og:description",
			content: "Track your Turath book orders."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { statusTone as n, Route as t };
