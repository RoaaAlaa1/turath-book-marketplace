using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD
=======
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.Models;
>>>>>>> b21604e709b97a38ad204c004fa9d31733422be5

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
<<<<<<< HEAD
        // قائمة مؤقتة في الذاكرة لتشغيل السلة بدون الحاجة لداتابيز حقيقية حالياً
        private static readonly List<TempCartItem> _memoryCart = new();

        // GET: api/Cart/1
        [HttpGet("{customerId}")]
        public IActionResult GetCart(string customerId)
        {
            var cartItems = _memoryCart.Where(c => c.CustomerId == customerId).ToList();
            return Ok(new { cartItems });
        }

        // POST: api/Cart/add
        [HttpPost("add")]
        public IActionResult AddToCart([FromBody] AddToCartRequest request)
        {
            if (request == null || request.ProductId <= 0 || request.Quantity <= 0)
            {
                return BadRequest(new { message = "بيانات المنتج أو الكمية غير صحيحة" });
            }

            var existingItem = _memoryCart.FirstOrDefault(c => c.CustomerId == request.CustomerId && c.ProductId == request.ProductId);

            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
            }
            else
            {
                _memoryCart.Add(new TempCartItem
                {
                    Id = _memoryCart.Count + 1,
                    CustomerId = request.CustomerId,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity
                });
            }

            return Ok(new { message = "تمت إضافة المنتج إلى السلة بنجاح! (وضع مؤقت)" });
        }

        // PUT: api/Cart/update-item
        [HttpPut("update-item")]
        public IActionResult UpdateItem([FromBody] UpdateCartItemRequest request)
        {
            var item = _memoryCart.FirstOrDefault(c => c.CustomerId == request.CustomerId && c.ProductId == request.ProductId);
            if (item == null) return NotFound(new { message = "العنصر غير موجود" });

            if (request.Quantity <= 0)
            {
                _memoryCart.Remove(item);
            }
            else
            {
                item.Quantity = request.Quantity;
            }

            return Ok(new { message = "تم التحديث بنجاح" });
        }

        // DELETE: api/Cart/remove-item
        [HttpDelete("remove-item")]
        public IActionResult RemoveItem([FromBody] RemoveCartItemRequest request)
        {
            var item = _memoryCart.FirstOrDefault(c => c.CustomerId == request.CustomerId && c.ProductId == request.ProductId);
            if (item != null)
            {
                _memoryCart.Remove(item);
            }
            return Ok(new { message = "تم الحذف بنجاح" });
        }

        // POST: api/Cart/checkout
        [HttpPost("checkout")]
        public IActionResult Checkout([FromBody] CheckoutRequest request)
        {
            var items = _memoryCart.Where(c => c.CustomerId == request.CustomerId).ToList();
            foreach (var item in items)
            {
                _memoryCart.Remove(item);
            }

            return Ok(new { message = "تم إتمام الطلب بنجاح", orderId = new Random().Next(1000, 9999) });
        }
    }

    // نماذج البيانات المؤقتة
    public class TempCartItem
    {
        public int Id { get; set; }
        public string CustomerId { get; set; } = "1";
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class AddToCartRequest
    {
        public string CustomerId { get; set; } = "1";
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartItemRequest
    {
        public string CustomerId { get; set; } = "1";
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class RemoveCartItemRequest
    {
        public string CustomerId { get; set; } = "1";
        public int ProductId { get; set; }
    }

    public class CheckoutRequest
    {
        public string CustomerId { get; set; } = "1";
    }
}
=======
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
>>>>>>> b21604e709b97a38ad204c004fa9d31733422be5
