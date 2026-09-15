using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.Models;

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
        [Authorize] // يتطلب توثيق الـ Token
        public async Task<IActionResult> CreateRequest(CreateCategoryRequestDto dto)
        {
            // استخراج Id المستخدم الحالي مسجل الدخول من الـ Token تلقائياً
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized("المستخدم غير مسجل الدخول أو الـ Token غير صالح.");
            }

            var categoryRequest = new CategoryRequest
            {
                CategoryName = dto.CategoryName,
                SellerId = sellerId, // ربط الـ ID الإجباري تلقائياً
                Status = "pending",
                RequestedAt = DateTime.UtcNow
            };

            _context.CategoryRequests.Add(categoryRequest);
            await _context.SaveChangesAsync();

            return Ok(categoryRequest);
        }
    }
}
