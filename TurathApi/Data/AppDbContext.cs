using Microsoft.EntityFrameworkCore;
using TurathApi.Models;

namespace TurathApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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
        }
    }
}
