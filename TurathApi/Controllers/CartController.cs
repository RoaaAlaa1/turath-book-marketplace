using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.Models;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // Returns the cart for the authenticated user
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetCart()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found." });
            }

            return Ok(cart);
        }

        /// Adds a product to the authenticated user's cart.
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized("Invalid user identifier.");
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                cart = new Cart { CustomerId = customerId };
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
            return Ok(new { message = "Product added to cart successfully." });
        }

        /// Updates item quantity in the authenticated user's cart.
        [HttpPut("update-item")]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized("Invalid user identifier.");
            }

            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart does not exist." });
            }

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == dto.ProductId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Product does not exist in the cart." });
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

        /// Removes an item from the authenticated user's cart.
        [HttpDelete("remove-item")]
        public async Task<IActionResult> RemoveCartItem([FromBody] RemoveCartItemDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized("Invalid user identifier.");
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart does not exist." });
            }

            var cartItem = cart.CartItems.FirstOrDefault(i => i.ProductId == dto.ProductId);
            if (cartItem == null)
            {
                return NotFound(new { message = "Product does not exist in the cart." });
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product removed from cart successfully." });
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest(new { message = "The cart is empty. Cannot complete the checkout process." });
            }

            decimal totalAmount = 0;
            var orderItemsList = new List<OrderItem>();

            foreach (var cartItem in cart.CartItems)
            {
                // جلب السعر من جدول الكتب (Books) بناءً على الـ ID
                var book = await _context.Books.FindAsync(cartItem.ProductId);
                decimal itemPrice = book != null ? book.Price : 0;

                totalAmount += cartItem.Quantity * itemPrice;

                orderItemsList.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    Price = itemPrice
                });
            }

            var order = new Order
            {
                CustomerId = customerId,
                Total = totalAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                OrderItems = orderItemsList
            };

            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cart.CartItems);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order placed successfully.", orderId = order.Id });
        }
    }
}
