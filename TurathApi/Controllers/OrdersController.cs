using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllers
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

        // Returns all orders for the currently authenticated customer.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            // Handles both Guid and string user IDs safely
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .Where(o => o.CustomerId.ToString() == customerIdStr)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        // Returns order details only if it belongs to the authenticated customer.
        [HttpGet("details/{id:int}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var customerIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerIdStr))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var ordersList = await _context.Orders
                .Include(o => o.OrderItems)
                .AsNoTracking()
                .Where(o => o.Id == id)
                .ToListAsync();

            var order = ordersList.FirstOrDefault(o => o.CustomerId.ToString() == customerIdStr);

            if (order == null)
            {
                return NotFound(new { message = "Order not found or you do not have permission to access it." });
            }

            return Ok(order);
        }
    }
}