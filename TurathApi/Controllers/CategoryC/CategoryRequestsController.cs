using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TurathApi.Data;
using TurathApi.Models;
using TurathApi.DTOs.Categories;

namespace TurathApi.Controllers.Categories
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize] // Requires Token authentication
        public async Task<IActionResult> CreateRequest([FromBody] CreateCategoryRequestDto dto)
        {
            // Automatically extract the current logged-in user's ID from the token
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized(new { message = "User is not logged in or the token is invalid." });
            }

            var categoryRequest = new CategoryRequest
            {
                CategoryName = dto.CategoryName,
                SellerId = sellerId, // Automatically link the seller ID
                Status = "pending",
                RequestedAt = DateTime.UtcNow
            };

            _context.CategoryRequests.Add(categoryRequest);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category request submitted successfully.", data = categoryRequest });
        }
    }

}