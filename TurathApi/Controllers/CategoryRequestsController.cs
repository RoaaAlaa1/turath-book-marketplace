using Microsoft.AspNetCore.Mvc;
using TurathApi.Data;
using TurathApi.Models;
using TurathApi.DTOs;

namespace TurathApi.Controllers
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
        public async Task<IActionResult> CreateRequest(CreateCategoryRequestDto dto)
        {
            var categoryRequest = new CategoryRequest
            {
                CategoryName = dto.CategoryName,
                Status = "pending",
                RequestedAt = DateTime.UtcNow
            };

            _context.CategoryRequests.Add(categoryRequest);
            await _context.SaveChangesAsync();

            return Ok(categoryRequest);
        }
    }
}
