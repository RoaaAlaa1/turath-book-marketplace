using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TurathApi.Data;
using TurathApi.DTOs;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Seller")] // Match seeded "Seller" role (case-sensitive)
    public class SellerOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SellerOrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(sellerId))
                return Unauthorized();

            // 1. Find book IDs owned by this seller
            var sellerBookIds = await _context.Books
                .Where(b => b.SellerId == sellerId)
                .Select(b => b.Id)
                .ToListAsync();

            if (!sellerBookIds.Any())
                return Ok(new List<SellerOrderDto>());

            // 2. Fetch orders containing any of this seller's books
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.OrderItems.Any(i => sellerBookIds.Contains(i.ProductId)))
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            // 3. Project only the line items that belong to this seller
            var result = orders.Select(o => new SellerOrderDto
            {
                OrderId = o.Id,
                CreatedAt = o.CreatedAt,
                Total = o.Total,
                Status = o.Status,
                Items = o.OrderItems
                    .Where(item => sellerBookIds.Contains(item.ProductId))
                    .Select(item => new SellerOrderItemDto
                    {
                        ProductId = item.ProductId, // int to int
                        Quantity = item.Quantity,
                        Price = item.Price
                    }).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpPut("{orderId:guid}/status")]
        public async Task<IActionResult> UpdateOrderStatus(
            Guid orderId,
            [FromBody] UpdateOrderStatusDto dto)
        {
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var sellerBookIds = await _context.Books
                .Where(b => b.SellerId == sellerId)
                .Select(b => b.Id)
                .ToListAsync();

            // Verify order exists and contains items belonging to this seller
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.OrderItems.Any(i => sellerBookIds.Contains(i.ProductId)));

            if (order == null)
                return NotFound(new { message = "Order not found or you are not authorized to update it." });

            order.Status = dto.Status.ToString();

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully." });
        }
    }
}