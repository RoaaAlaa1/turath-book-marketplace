using Microsoft.AspNetCore.Mvc;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
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