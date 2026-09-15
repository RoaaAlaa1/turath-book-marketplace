using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // متاح فقط للأدمن
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;

        public AdminController(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // 1. عرض قائمة جميع المستخدمين
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.LockoutEnabled,
                    IsSuspended = u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTimeOffset.UtcNow
                })
                .ToListAsync();

            return Ok(users);
        }

        // 2. تفعيل / إيقاف حساب مستخدم (Toggle Suspend/Activate)
        [HttpPut("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("المستخدم غير موجود.");
            }

            // التأكد من تفعيل خاصية الحظر للمستخدم
            await _userManager.SetLockoutEnabledAsync(user, true);

            var isCurrentlySuspended = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;

            if (isCurrentlySuspended)
            {
                // إزالة الحظر (تفعيل الحساب)
                await _userManager.SetLockoutEndDateAsync(user, null);
                return Ok(new { message = $"تم تفعيل حساب المستخدم {user.UserName} بنجاح." });
            }
            else
            {
                // حظر الحساب حتى سنة 2099 (تعليق الحساب)
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
                return Ok(new { message = $"تم حظر/تعليق حساب المستخدم {user.UserName} بنجاح." });
            }
        }

        // 3. عرض جميع طلبات الأقسام المعلقة (Pending)
        [HttpGet("category-requests")]
        public async Task<IActionResult> GetPendingCategoryRequests()
        {
            var requests = await _context.CategoryRequests
                .Where(r => r.Status == "pending")
                .Select(r => new
                {
                    r.Id,
                    r.CategoryName,
                    r.SellerId,
                    r.RequestedAt,
                    r.Status
                })
                .ToListAsync();

            return Ok(requests);
        }

        // 4. الموافقة على طلب قسم وإضافته تلقائياً لقائمة الأقسام الفعالة
        [HttpPost("category-requests/{id}/approve")]
        public async Task<IActionResult> ApproveCategoryRequest(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound("الطلب غير موجود.");
            }

            // تحويل حالة الطلب إلى Approved
            request.Status = "Approved";

            // إضافة القسم الجديد تلقائياً لجدول Categories
            var newCategory = new Category
            {
                Name = request.CategoryName
            };

            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"تم قبول القسم '{request.CategoryName}' وإضافته بنجاح." });
        }

        // 5. رفض طلب القسم
        [HttpPost("category-requests/{id}/reject")]
        public async Task<IActionResult> RejectCategoryRequest(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound("الطلب غير موجود.");
            }

            request.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"تم رفض طلب القسم '{request.CategoryName}'." });
        }
    }
}