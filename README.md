# Turath (تُراث) — Antique & Heritage Book Marketplace

Turath is an end-to-end full-stack marketplace dedicated to buying, selling, and preserving antique, rare, and heritage books across Egypt and the MENA region. The platform connects passionate readers, verified independent sellers, and cultural institutions through a curated catalog featuring real-time stock management, secure checkout, dynamic role handling, and complete provenance tracking.

---

## Tech Stack

### Backend
- **Framework:** ASP.NET Core 8 / .NET 9 Web API
- **Database & ORM:** Microsoft SQL Server with Entity Framework Core (Code-First)
- **Authentication:** ASP.NET Core Identity & JWT (JSON Web Tokens)
- **Architecture:** Clean REST API with LINQ projections, DTO layer, and role-based authorization (`Customer`, `Seller`, `Admin`)

### Frontend
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS with Radix UI / Shadcn UI components
- **State Management:** Custom React Context store with optimistic UI updates and server synchronization
- **Routing & Feedback:** React Router, Sonner toast notifications, Lucide React icons

---

## Project Structure

```text
├── TurathApi/             # ASP.NET Core Web API
│   ├── Controllers/       # REST controllers (Books, Orders, Cart, Auth, Categories)
│   ├── Data/              # AppDbContext and EF Core configurations
│   ├── DTOs/              # Request and Response transfer objects
│   ├── Models/            # Domain entities (Book, Order, OrderItem, User, Category)
│   └── Program.cs         # Dependency injection, middleware, JWT, and CORS setup
├── Grad-front/            # React + TypeScript single-page application
│   ├── src/
│   │   ├── components/    # Reusable UI widgets (BookCard, BookCover, Navigation)
│   │   ├── lib/turath/    # Context stores, API fetchers, and TypeScript types
│   │   └── pages/         # Core views (Catalog, Book Details, Checkout, Orders)
│   └── package.json
├── scripts/               # SQL database schema and data seeding scripts
└── README.md
```

---

## Key Features

- **Rich Catalog & Discovery:** Browse books across 12 distinct categories, live keyword search, dynamic sorting by price, and condition/age ratings.
- **Verified Cover CDN:** Dynamic image mapping delivering high-resolution book covers directly via the Open Library CDN.
- **Multi-Role User Hierarchy:**
  - **Readers / Customers:** Browse inventory, manage user-scoped wishlists, maintain persistent cart items, and complete orders.
  - **Sellers:** Dedicated dashboard to create, update, manage quantities, and track sales for individual listings.
  - **Admins:** Global moderation, book approval/rejection workflows, and seller vetting.
- **Order & Provenance Pipeline:** Full order tracking with calculated tax, shipping rates, dynamic line-item lookups, and order status transitions (`Pending` to `Cancelled` or `Completed`).
- **Resilient Data Sync:** Two-way sync bridging offline/cached guest actions with authenticated SQL Server records upon user login.

---

## Getting Started

### Prerequisites

- [.NET 8 SDK or .NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or higher) & `npm`
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) (LocalDB, Express, or full instance)

---

### Backend Setup

1. **Navigate to the API directory:**
   ```bash
   cd TurathApi
   ```

2. **Configure Connection String:**
   Update `appsettings.json` with your local SQL Server instance:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=TurathDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
   }
   ```

3. **Apply Database Migrations & Seed Data:**
   ```bash
   dotnet ef database update
   ```
   *(Optional)* Run any custom seeding SQL scripts located in `/scripts` within SQL Server Management Studio (SSMS) to populate catalog books, categories, and test roles.

4. **Run the API:**
   ```bash
   dotnet run
   ```
   The API will listen at `https://localhost:7245` or `http://localhost:5245`. Interactive Swagger documentation is available at `/swagger`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd Grad-front
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create or verify `.env` pointing to your backend API port:
   ```env
   VITE_API_URL=http://localhost:5245
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## Default Test Accounts

Pre-configured seed accounts available for local testing and demonstration:

| Role | Email | Default Password |
| :--- | :--- | :--- |
| **Admin** | `admin@turath.eg` | `P@ssword123!` |
| **Verified Seller** | `turath.foundation@turath.eg` | `P@ssword123!` |
| **Customer** | `ahmed.hassan@turath.eg` | `P@ssword123!` |

---

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is developed as part of an engineering graduation capstone. Distributed under the MIT License.
