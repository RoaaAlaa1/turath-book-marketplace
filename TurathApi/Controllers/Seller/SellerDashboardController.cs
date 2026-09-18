using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs.Seller;
using TurathApi.Models;

namespace TurathApi.Controllers.Seller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Seller")]
    public class SellerDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

    public SellerDashboardController(
        AppDbContext context,
        UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("books-count")]
        public async Task<IActionResult> GetBooksCount()
        {
            var sellerId = _userManager.GetUserId(User);

            var totalBooks = await _context.Books
                .CountAsync(b => b.SellerId == sellerId);

            return Ok(new
            {
                totalBooks
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var sellerId = _userManager.GetUserId(User);

            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized();
            }

            var totalBooks = await _context.Books
                .CountAsync(b => b.SellerId == sellerId);

            var totalOrders = await _context.OrderItems
                            .Where(oi => _context.Books
                            .Any(b => b.Id == oi.ProductId && b.SellerId == sellerId))
                            .Select(oi => oi.OrderId)
                            .Distinct()
                            .CountAsync();

            var totalRevenue = await _context.OrderItems
                .Where(oi => _context.Books
                    .Any(b => b.Id == oi.ProductId && b.SellerId == sellerId))
                .SumAsync(oi => oi.Price * oi.Quantity);

            return Ok(new SellerDashboardDto
            {
                TotalBooks = totalBooks,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue
            });
        }
    }

}
