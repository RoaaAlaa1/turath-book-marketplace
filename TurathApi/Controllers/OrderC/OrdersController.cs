using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllers.Orders
{
    public class CreateOrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateOrderRequest
    {
        public string? ShippingAddress { get; set; }
        public List<CreateOrderItemRequest> Items { get; set; } = new();
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/Orders
        // GET /api/Orders/my-orders
        // GET /api/Orders/{customerId}
        [HttpGet]
        [HttpGet("my-orders")]
        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetMyOrders(string? customerId = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var isAdmin = User.IsInRole("Admin");
            var query = _context.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrEmpty(customerId) && customerId != "my-orders" && customerId != "all")
            {
                if (customerId != currentUserId && !isAdmin)
                {
                    return Forbid();
                }
                query = query.Where(o => o.CustomerId == customerId);
            }
            else if (!isAdmin || customerId == "my-orders")
            {
                query = query.Where(o => o.CustomerId == currentUserId);
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    id = o.Id,
                    customerId = o.CustomerId,
                    customerName = _context.Users
                        .Where(u => u.Id == o.CustomerId)
                        .Select(u => !string.IsNullOrWhiteSpace(u.FirstName)
                            ? $"{u.FirstName} {u.LastName}".Trim()
                            : (u.UserName ?? u.Email ?? "Customer"))
                        .FirstOrDefault() ?? "Customer",
                    customerEmail = _context.Users
                        .Where(u => u.Id == o.CustomerId)
                        .Select(u => u.Email)
                        .FirstOrDefault() ?? "",
                    status = o.Status,
                    totalPrice = o.Total,
                    total = o.Total,
                    createdAt = o.CreatedAt,
                    orderItems = o.OrderItems.Select(oi => new
                    {
                        id = oi.Id,
                        productId = oi.ProductId,
                        bookId = oi.ProductId,
                        title = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.Title).FirstOrDefault() ?? "Book",
                        author = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.Author).FirstOrDefault() ?? "",
                        imageUrl = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.ImageUrl).FirstOrDefault() ?? "",
                        unitPrice = oi.Price,
                        price = oi.Price,
                        quantity = oi.Quantity
                    }),
                    items = o.OrderItems.Select(oi => new
                    {
                        id = oi.Id,
                        productId = oi.ProductId,
                        bookId = oi.ProductId,
                        title = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.Title).FirstOrDefault() ?? "Book",
                        author = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.Author).FirstOrDefault() ?? "",
                        imageUrl = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.ImageUrl).FirstOrDefault() ?? "",
                        unitPrice = oi.Price,
                        price = oi.Price,
                        quantity = oi.Quantity
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }

        // POST /api/Orders
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            if (request == null || request.Items == null || !request.Items.Any())
            {
                return BadRequest(new { message = "Order must contain at least one item." });
            }

            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0m;

            foreach (var item in request.Items)
            {
                var book = await _context.Books.FirstOrDefaultAsync(b => b.Id == item.ProductId);
                if (book == null)
                {
                    return BadRequest(new { message = $"Book #{item.ProductId} not found." });
                }

                if (book.Quantity < item.Quantity)
                {
                    return BadRequest(new { message = $"Only {book.Quantity} copies of '{book.Title}' are available." });
                }

                var lineTotal = item.Quantity * book.Price;
                totalAmount += lineTotal;

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = book.Price
                });

                book.Quantity -= item.Quantity;
            }

            var order = new Order
            {
                CustomerId = currentUserId,
                Total = totalAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);

            // Also clear cart in DB if present
            var userCart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == currentUserId);
            if (userCart != null && userCart.CartItems.Any())
            {
                _context.CartItems.RemoveRange(userCart.CartItems);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order placed successfully.",
                orderId = order.Id,
                id = order.Id,
                total = totalAmount,
                totalPrice = totalAmount
            });
        }

        // GET /api/Orders/details/{id:guid}
        [HttpGet("details/{id:guid}")]
        public async Task<IActionResult> GetOrder(Guid id)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .Where(o => o.Id == id && o.CustomerId == customerId)
                .Select(o => new
                {
                    id = o.Id,
                    customerId = o.CustomerId,
                    status = o.Status,
                    totalPrice = o.Total,
                    createdAt = o.CreatedAt,
                    items = o.OrderItems.Select(oi => new
                    {
                        id = oi.Id,
                        productId = oi.ProductId,
                        title = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.Title).FirstOrDefault() ?? "Book",
                        author = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.Author).FirstOrDefault() ?? "",
                        imageUrl = _context.Books.Where(b => b.Id == oi.ProductId).Select(b => b.ImageUrl).FirstOrDefault() ?? "",
                        unitPrice = oi.Price,
                        quantity = oi.Quantity
                    })
                })
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound(new { message = "Order not found or you do not have permission to access it." });
            }

            return Ok(order);
        }

        // PATCH /api/Orders/{id:guid}/cancel
        [HttpPatch("{id:guid}/cancel")]
        public async Task<ActionResult> CancelOrder(Guid id)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == customerId);

            if (order == null)
            {
                return NotFound(new { message = "Order not found or not accessible." });
            }

            if (order.Status != "Pending")
            {
                return BadRequest(new { message = "Only pending orders can be cancelled." });
            }

            order.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order cancelled successfully." });
        }

        // PUT /api/Orders/{id}/status
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<ActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusPayload dto)
        {
            Order? order = null;
            if (Guid.TryParse(id, out var guidId))
            {
                order = await _context.Orders.FindAsync(guidId);
            }
            if (order == null)
            {
                order = await _context.Orders.FirstOrDefaultAsync(o => o.Id.ToString() == id);
            }
            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                order.Status = dto.Status.Trim();
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = $"Order status updated to {order.Status}." });
        }
    }

    public class UpdateOrderStatusPayload
    {
        public string Status { get; set; } = string.Empty;
    }
}