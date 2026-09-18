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
        [HttpGet("{customerId}")]
        [Authorize]
        public async Task<IActionResult> GetCart(string customerId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            // Ensure customers can only view their own cart (unless Admin)
            if (customerId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
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

            // التأكد إن المنتج موجود أساساً في جدول Books
            var productExists = await _context.Books.AnyAsync(b => b.Id == dto.ProductId);
            if (!productExists)
            {
                return NotFound(new { message = "Product not found." });
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

        /// Creates an order from the current cart items for the authenticated user.
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized("Invalid user identifier.");
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null || !cart.CartItems.Any())
            {
                return BadRequest(new { message = "The cart is empty. Cannot complete the checkout process." });
            }

            // جلب أسعار المنتجات الحقيقية من قاعدة البيانات لحساب الإجمالي بدقة
            var productIds = cart.CartItems.Select(ci => ci.ProductId).ToList();
            var products = await _context.Books.Where(b => productIds.Contains(b.Id)).ToDictionaryAsync(b => b.Id, b => b.Price); // افترضنا أن حقل السعر اسمه Price، لو اسم تاني عدله

            decimal totalAmount = 0;
            var orderItemsList = new List<OrderItem>();

            foreach (var cartItem in cart.CartItems)
            {
                // لو جدول الكتب عندك اسمه مختلف أو الحقل مش Price تقدر تظبطه، وهنا بنجيب السعر الحقيقي
                decimal itemPrice = products.TryGetValue(cartItem.ProductId, out var price) ? price : 0;
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