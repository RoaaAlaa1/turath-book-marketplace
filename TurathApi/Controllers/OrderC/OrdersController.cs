using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllers.Orders
{
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

        // GET /api/Orders/{customerId}
        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetMyOrders(string customerId)
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

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.CreatedAt)
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
                .ToListAsync();

            return Ok(orders);
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
    }
}