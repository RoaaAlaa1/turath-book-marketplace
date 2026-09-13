using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.Models;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCart(string customerId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart is empty or not found for this customer." });
            }

            return Ok(cart);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
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

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == dto.ProductId);

            if (cartItem != null)
            {
                cartItem.Quantity += dto.Quantity;
            }
            else
            {
                cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Item added to cart successfully." });
        }

        [HttpPut("update-item")]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto dto)
        {
            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found." });
            }

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == dto.ProductId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Item not found in cart." });
            }

            if (dto.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                cartItem.Quantity = dto.Quantity;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart updated successfully." });
        }

        [HttpDelete("remove-item")]
        public async Task<IActionResult> RemoveCartItem([FromBody] RemoveCartItemDto dto)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found." });
            }

            var cartItem = cart.CartItems.FirstOrDefault(i => i.ProductId == dto.ProductId);
            if (cartItem == null)
            {
                return NotFound(new { message = "Item not found in cart." });
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Item removed from cart successfully." });
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest(new { message = "Cart is empty, cannot checkout." });
            }

            decimal totalAmount = cart.CartItems.Sum(item => item.Quantity * 10);

            var order = new Order
            {
                CustomerId = dto.CustomerId,
                Total = totalAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            foreach (var cartItem in cart.CartItems)
            {
                order.OrderItems.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    Price = 10
                });
            }

            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cart.CartItems);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Checkout completed successfully.", orderId = order.Id });
        }
    }
}
