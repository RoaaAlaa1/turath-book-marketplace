using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TurathApi.Models;

namespace TurathApi.Data
{
    // تحويل الكلاس ليورث من IdentityDbContext مع ApplicationUser
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Book> Books => Set<Book>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ضروري جداً لتسجيل جداول Identity الأساسية (AspNetUsers, AspNetRoles, ...)
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Review>(entity =>
            {
                entity.ToTable("Reviews");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Id).HasColumnName("id");
                entity.Property(r => r.CustomerId).HasColumnName("customer_id");
                entity.Property(r => r.BookId).HasColumnName("book_id");
                entity.Property(r => r.Rating).HasColumnName("rating");
                entity.Property(r => r.Comment).HasColumnName("comment").IsRequired();
                entity.Property(r => r.CreatedAt).HasColumnName("created_at");
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasMany(c => c.CartItems)
                    .WithOne(i => i.Cart)
                    .HasForeignKey(i => i.CartId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.Total).HasPrecision(18, 2);
                entity.HasMany(o => o.OrderItems)
                    .WithOne(i => i.Order)
                    .HasForeignKey(i => i.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(i => i.Price).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("Categories");
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Id).HasColumnName("id");
                entity.Property(c => c.Name).HasColumnName("name").IsRequired();
                entity.Property(c => c.Description).HasColumnName("description");
            });

            modelBuilder.Entity<Book>(entity =>
            {
                entity.ToTable("Books");
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Id).HasColumnName("id");
                entity.Property(b => b.Title).HasColumnName("title").IsRequired();
                entity.Property(b => b.Author).HasColumnName("author").IsRequired();
                entity.Property(b => b.Description).HasColumnName("description");
                entity.Property(b => b.Price).HasColumnName("price").HasPrecision(18, 2);
                entity.Property(b => b.Quantity).HasColumnName("quantity");
                entity.Property(b => b.CategoryId).HasColumnName("category_id");
                entity.Property(b => b.SellerId).HasColumnName("seller_id");
                entity.Property(b => b.ImageUrl).HasColumnName("image_url");
                entity.Property(b => b.Condition).HasColumnName("condition").HasConversion<string>();
                entity.Property(b => b.AgeRating).HasColumnName("age_rating");
                entity.Property(b => b.ApprovalStatus).HasColumnName("approval_status").HasConversion<string>();

                entity.HasOne(b => b.Category)
                    .WithMany(c => c.Books)
                    .HasForeignKey(b => b.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed data — lets the rest of the team build against real rows immediately.
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Fiction" },
                new Category { Id = 2, Name = "Science & Technology" },
                new Category { Id = 3, Name = "Children's Books" },
                new Category { Id = 4, Name = "History" }
            );

            modelBuilder.Entity<Book>().HasData(
                new Book
                {
                    Id = 1,
                    Title = "The Alchemist",
                    Author = "Paulo Coelho",
                    Description = "A shepherd boy's journey to find treasure and discover his personal legend.",
                    Price = 85.00m,
                    Quantity = 4,
                    CategoryId = 1,
                    SellerId = 1,
                    ImageUrl = "/images/books/the-alchemist.jpg",
                    Condition = TurathApi.Models.Enums.BookCondition.LikeNew,
                    AgeRating = "All Ages",
                    ApprovalStatus = TurathApi.Models.Enums.ApprovalStatus.Approved
                },
                new Book
                {
                    Id = 2,
                    Title = "Clean Code",
                    Author = "Robert C. Martin",
                    Description = "A handbook of agile software craftsmanship, covering principles and practices for writing readable, maintainable code.",
                    Price = 220.00m,
                    Quantity = 2,
                    CategoryId = 2,
                    SellerId = 2,
                    ImageUrl = "/images/books/clean-code.jpg",
                    Condition = TurathApi.Models.Enums.BookCondition.Good,
                    AgeRating = "All Ages",
                    ApprovalStatus = TurathApi.Models.Enums.ApprovalStatus.Approved
                },
                new Book
                {
                    Id = 3,
                    Title = "Charlotte's Web",
                    Author = "E. B. White",
                    Description = "A classic story of friendship between a pig named Wilbur and a spider named Charlotte.",
                    Price = 60.00m,
                    Quantity = 6,
                    CategoryId = 3,
                    SellerId = 3,
                    ImageUrl = "/images/books/charlottes-web.jpg",
                    Condition = TurathApi.Models.Enums.BookCondition.Acceptable,
                    AgeRating = "8+",
                    ApprovalStatus = TurathApi.Models.Enums.ApprovalStatus.Approved
                },
                new Book
                {
                    Id = 4,
                    Title = "Sapiens: A Brief History of Humankind",
                    Author = "Yuval Noah Harari",
                    Description = "An exploration of how Homo sapiens came to dominate the world, from the cognitive revolution to today.",
                    Price = 150.00m,
                    Quantity = 3,
                    CategoryId = 4,
                    SellerId = 1,
                    ImageUrl = "/images/books/sapiens.jpg",
                    Condition = TurathApi.Models.Enums.BookCondition.Good,
                    AgeRating = "16+",
                    ApprovalStatus = TurathApi.Models.Enums.ApprovalStatus.Approved
                },
                new Book
                {
                    Id = 5,
                    Title = "Untitled Manuscript Draft",
                    Author = "Unknown",
                    Description = "Awaiting copyright verification before it can be listed publicly.",
                    Price = 40.00m,
                    Quantity = 1,
                    CategoryId = 1,
                    SellerId = 2,
                    ImageUrl = "/images/books/placeholder.jpg",
                    Condition = TurathApi.Models.Enums.BookCondition.Acceptable,
                    AgeRating = "All Ages",
                    ApprovalStatus = TurathApi.Models.Enums.ApprovalStatus.Pending
                }
            );
        }
    }
}