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

            if (customerId != currentUserId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                return Ok(new { customerId, items = new List<CartItem>() });
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

<<<<<<< HEAD
            if (dto.ProductId <= 0 || dto.Quantity <= 0)
            {
                return BadRequest(new { message = "Invalid product or quantity." });
            }

            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == dto.ProductId && b.ApprovalStatus == TurathApi.Models.Enums.ApprovalStatus.Approved);
            if (book == null)
            {
                return NotFound(new { message = "Book not found or not approved." });
=======
            // التأكد إن المنتج موجود أساساً في جدول Books
            var productExists = await _context.Books.AnyAsync(b => b.Id == dto.ProductId);
            if (!productExists)
            {
                return NotFound(new { message = "Product not found." });
>>>>>>> cfa0f7b9e26070812dc28f615256b8ccbce6e37f
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

            var newQuantity = (cartItem?.Quantity ?? 0) + dto.Quantity;
            if (newQuantity > book.Quantity)
            {
                return BadRequest(new { message = $"Only {book.Quantity} copies are available for this book." });
            }

            if (cartItem != null)
            {
                cartItem.Quantity = newQuantity;
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

            if (dto.ProductId <= 0)
            {
                return BadRequest(new { message = "Invalid product selection." });
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

            var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == dto.ProductId && b.ApprovalStatus == TurathApi.Models.Enums.ApprovalStatus.Approved);
            if (book == null)
            {
                return NotFound(new { message = "Book is no longer available." });
            }

            if (dto.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                if (dto.Quantity > book.Quantity)
                {
                    return BadRequest(new { message = $"Only {book.Quantity} copies are available." });
                }

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

<<<<<<< HEAD
            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0m;

            foreach (var cartItem in cart.CartItems)
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == cartItem.ProductId && b.ApprovalStatus == TurathApi.Models.Enums.ApprovalStatus.Approved);
                if (book == null)
                {
                    return BadRequest(new { message = $"Book #{cartItem.ProductId} is no longer available." });
                }

                if (cartItem.Quantity > book.Quantity)
                {
                    return BadRequest(new { message = $"Only {book.Quantity} copies of '{book.Title}' are in stock." });
                }

                var lineTotal = cartItem.Quantity * book.Price;
                totalAmount += lineTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    Price = book.Price
                });

                book.Quantity -= cartItem.Quantity;
=======
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
>>>>>>> cfa0f7b9e26070812dc28f615256b8ccbce6e37f
            }

            var order = new Order
            {
                CustomerId = customerId,
                Total = totalAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
<<<<<<< HEAD
                OrderItems = orderItems
=======
                OrderItems = orderItemsList
>>>>>>> cfa0f7b9e26070812dc28f615256b8ccbce6e37f
            };

            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cart.CartItems);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order placed successfully.", orderId = order.Id, total = totalAmount });
        }
    }
}