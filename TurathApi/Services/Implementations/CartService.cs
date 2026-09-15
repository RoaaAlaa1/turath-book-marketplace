using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.DTOs.Cart;
using TurathApi.Models;
using TurathApi.Services.Interfaces;

namespace TurathApi.Services.Implementations
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Cart?> GetCartByCustomerIdAsync(string customerId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);
        }

        public async Task AddToCartAsync(AddToCartDto dto)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            if (cart == null)
            {
                cart = new Cart { CustomerId = dto.CustomerId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var cartItem = cart.CartItems.FirstOrDefault(i => i.ProductId == dto.ProductId);

            if (cartItem != null)
            {
                cartItem.Quantity += dto.Quantity;
            }
            else
            {
                cart.CartItems.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateCartItemAsync(UpdateCartItemDto dto)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            if (cart == null) return false;

            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == dto.ProductId);
            if (item == null) return false;

            if (dto.Quantity <= 0)
            {
                _context.CartItems.Remove(item);
            }
            else
            {
                item.Quantity = dto.Quantity;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveCartItemAsync(RemoveCartItemDto dto)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            if (cart == null) return false;

            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == dto.ProductId);
            if (item == null) return false;

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Guid> CheckoutAsync(string customerId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new InvalidOperationException("Cart is empty or not found.");
            }

            // Using transaction for data consistency between Cart and Orders
            using var transaction = await _context.Database.BeginTransactionAsync();

            decimal totalAmount = cart.CartItems.Sum(item => item.Quantity * 10m);

            var order = new Order
            {
                CustomerId = customerId,
                Total = totalAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            foreach (var item in cart.CartItems)
            {
                order.OrderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = 10m
                });
            }

            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cart.CartItems);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return order.Id;
        }
    }
}