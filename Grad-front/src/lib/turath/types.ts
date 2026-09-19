export type Role = "customer" | "seller" | "pendingSeller" | "admin";

export type Condition = "Acceptable" | "Good" | "Like New" | "Vintage Collector";

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export type UserStatus = "active" | "suspended";

export type SellerState = "approved" | "pending" | "rejected";

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  price: number;
  availableQuantity: number;
  category: string;
  condition: Condition;
  description: string;
  conditionNotes: string;
  sellerId: string;
  sellerName?: string;
  spine: "rust" | "navy" | "amber" | "sage" | "crimson";
  imageUrl: string;
  images: string[];
  reviews: Review[];
  flagged: boolean;
  removed: boolean;
  ageRating: string;
  approvalStatus: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  genres?: string[];
  address?: string;
  storeName?: string;
  bio?: string;
  role: Exclude<Role, "pendingSeller">;
  sellerState?: SellerState;
  status: UserStatus;
  joined: string;
}

export interface OrderLine {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  sellerId: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  address: string;
}

export interface CartItem {
  bookId: string;
  quantity: number;
}
