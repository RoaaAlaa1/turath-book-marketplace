using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SellerOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

    public SellerOrdersController(AppDbContext context)
        {
            _context = context;
        }

        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "seller")]
        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var sellerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(sellerId))
                return Unauthorized();

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.OrderItems.Any())
                .ToListAsync();

            var result = orders.Select(o => new SellerOrderDto
            {
                OrderId = o.Id,
                CreatedAt = o.CreatedAt,
                Total = o.Total,
                Status = o.Status,
                Items = o.OrderItems.Select(item => new SellerOrderItemDto
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = item.Price
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "seller")]
        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(
            Guid orderId,
            [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return NotFound(new { message = "Order not found." });

            order.Status = dto.Status.ToString();

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully." });
        }
    }

}
