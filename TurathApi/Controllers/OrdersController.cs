<<<<<<< HEAD
﻿using Microsoft.AspNetCore.Mvc;
=======
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
>>>>>>> b21604e709b97a38ad204c004fa9d31733422be5
using TurathApi.Models;

namespace TurathApi.Controllers
{
<<<<<<< HEAD
    public class OrdersController : Controller
    {
        // قوائم مؤقتة لتخزين الطلبات وبنودها في الذاكرة
        private static readonly List<Order> _memoryOrders = new();
        private static readonly List<OrderItem> _memoryOrderItems = new();

        // 1. عرض صفحة تتبع الطلبات (MVC View)
        [HttpGet("Orders/Track")]
        public IActionResult Track()
        {
            return View();
        }

        // 2. جلب طلبات العميل (API)
        [HttpGet("api/Orders/customer/{customerId}")]
        public IActionResult GetCustomerOrders(string customerId)
        {
            var orders = _memoryOrders.Where(o => o.CustomerId == customerId).ToList();
            return Ok(orders);
        }

        // 3. إنشاء طلب جديد وتجميد السعر لكل بند (API)
        [HttpPost("api/Orders/create")]
        public IActionResult CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
            {
                return BadRequest(new { message = "السلة فارغة أو بيانات الطلب غير صالحة" });
            }

            var orderId = Guid.NewGuid();
            decimal calculatedTotal = 0;

            // معالجة بنود الطلب وتجميد السعر لكل عنصر
            foreach (var item in request.Items)
            {
                decimal frozenPrice = item.Price; // تجميد السعر وقت الشراء
                calculatedTotal += frozenPrice * item.Quantity;

                _memoryOrderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = orderId,
                    ProductId = item.ProductId, // متوافقة مع الـ Guid في الموديل عندك
                    Quantity = item.Quantity,
                    Price = frozenPrice // مطابقة لخصائص موديل OrderItem عندك
                });
            }

            var newOrder = new Order
            {
                Id = orderId,
                CustomerId = string.IsNullOrEmpty(request.CustomerId) ? "1" : request.CustomerId,
                Total = calculatedTotal,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _memoryOrders.Add(newOrder);

            return Ok(new { message = "تم تحويل السلة إلى طلب بنجاح", orderId = newOrder.Id, total = newOrder.Total });
        }

        // 4. تحديث حالة الطلب (API)
        [HttpPut("api/Orders/update-status")]
        public IActionResult UpdateOrderStatus([FromBody] UpdateOrderStatusRequest request)
        {
            var order = _memoryOrders.FirstOrDefault(o => o.Id == request.OrderId);
            if (order == null)
            {
                return NotFound(new { message = "الطلب غير موجود" });
            }

            order.Status = request.Status;
            return Ok(new { message = "تم تحديث حالة الطلب بنجاح", orderId = order.Id, newStatus = order.Status });
        }
    }

    // كلاسات الـ Requests والـ DTOs المطلوبة
    public class CreateOrderRequest
    {
        public string CustomerId { get; set; } = "1";
        public List<CartItemDto> Items { get; set; } = new();
    }

    public class CartItemDto
    {
        public Guid ProductId { get; set; } // تتوافق مع نوع Guid في الـ OrderItem
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        public Guid OrderId { get; set; }
        public string Status { get; set; } = "Pending";
    }
}
=======
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders(string customerId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("details/{id:guid}")]
        public async Task<ActionResult<Order>> GetOrder(Guid id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            return Ok(order);
        }
    }
}
>>>>>>> b21604e709b97a38ad204c004fa9d31733422be5
