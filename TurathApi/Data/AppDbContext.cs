using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TurathApi.Models;

namespace TurathApi.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<SellerRequest> SellerRequests { get; set; }
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Book> Books => Set<Book>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Comment> Comments => Set<Comment>();
        public DbSet<CategoryRequest> CategoryRequests => Set<CategoryRequest>();
        public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. ضبط جدول SellerRequests
            modelBuilder.Entity<SellerRequest>(entity =>
            {
                entity.ToTable("SellerRequests");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Id).HasColumnName("id");
                entity.Property(r => r.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(r => r.Status).HasColumnName("status").HasConversion<string>();
                entity.Property(r => r.RequestedAt).HasColumnName("requested_at");
                entity.Property(r => r.ProcessedAt).HasColumnName("processed_at");

                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // 2. ضبط جدول CategoryRequests لمنع مسارات الحذف المتتابعة المتعددة (Cascade Paths Cycle)
            modelBuilder.Entity<CategoryRequest>(entity =>
            {
                entity.HasOne(cr => cr.Seller)
                    .WithMany()
                    .HasForeignKey(cr => cr.SellerId)
                    .OnDelete(DeleteBehavior.Restrict); // تعيين الحذف إلى Restrict لمنع خطأ FK_CategoryRequests
            });

            // 3. ضبط باقي الجداول
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

                entity.HasOne(r => r.Book)
                    .WithMany(b => b.Reviews)
                    .HasForeignKey(r => r.BookId)
                    .OnDelete(DeleteBehavior.NoAction);

                
                entity.HasOne(r => r.Customer)
                    .WithMany()
                    .HasForeignKey(r => r.CustomerId)
                    .OnDelete(DeleteBehavior.NoAction);
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

            // 4. ضبط جدول WishlistItems
            modelBuilder.Entity<WishlistItem>(entity =>
            {
                entity.ToTable("WishlistItems");
                entity.HasKey(w => w.Id);
                entity.Property(w => w.Id).HasColumnName("id");
                entity.Property(w => w.CustomerId).HasColumnName("customer_id").IsRequired();
                entity.Property(w => w.BookId).HasColumnName("book_id");
                entity.Property(w => w.AddedAt).HasColumnName("added_at");

                entity.HasIndex(w => new { w.CustomerId, w.BookId }).IsUnique();

                entity.HasOne(w => w.Book)
                    .WithMany()
                    .HasForeignKey(w => w.BookId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<ApplicationUser>()
                    .WithMany()
                    .HasForeignKey(w => w.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed data 
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Fiction" },
                new Category { Id = 2, Name = "Science & Technology" },
                new Category { Id = 3, Name = "Children's Books" },
                new Category { Id = 4, Name = "History" }
            );

           
        }
    }
}
