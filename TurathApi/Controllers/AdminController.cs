using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;
using TurathApi.Models.Enums;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Accessible only for Admin
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;

        public AdminController(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // ==================== USER MANAGEMENT ====================

        // 1. Get list of all users
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

        // 2. Toggle user account status (Suspend / Activate)
        [HttpPut("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            await _userManager.SetLockoutEnabledAsync(user, true);

            var isCurrentlySuspended = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;

            if (isCurrentlySuspended)
            {
                await _userManager.SetLockoutEndDateAsync(user, null);
                return Ok(new { message = $"User account '{user.UserName}' has been activated successfully." });
            }
            else
            {
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
                return Ok(new { message = $"User account '{user.UserName}' has been suspended successfully." });
            }
        }

        // ==================== CATEGORY REQUESTS MANAGEMENT ====================

        // 3. Get all pending category requests
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

        // 4. Approve category request and automatically add it to active categories
        [HttpPost("category-requests/{id}/approve")]
        public async Task<IActionResult> ApproveCategoryRequest(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound(new { message = "Category request not found." });
            }

            request.Status = "Approved";

            var newCategory = new Category
            {
                Name = request.CategoryName
            };

            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Category request '{request.CategoryName}' has been approved and added successfully." });
        }

        // 5. Reject category request
        [HttpPost("category-requests/{id}/reject")]
        public async Task<IActionResult> RejectCategoryRequest(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound(new { message = "Category request not found." });
            }

            request.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Category request '{request.CategoryName}' has been rejected." });
        }

        // ==================== BOOK APPROVAL QUEUE ====================

        // 6. Get pending books awaiting admin approval
        [HttpGet("books/pending")]
        public async Task<IActionResult> GetPendingBooks()
        {
            var pendingBooks = await _context.Books
                .Where(b => b.ApprovalStatus == ApprovalStatus.Pending)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Price,
                    b.SellerId,
                    ApprovalStatus = b.ApprovalStatus.ToString()
                })
                .ToListAsync();

            return Ok(pendingBooks);
        }


        // 7. عرض جميع الكتب للأدمن
        [HttpGet("books")]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _context.Books
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    b.Price,
                    b.Quantity,
                    b.SellerId,
                    ApprovalStatus = b.ApprovalStatus.ToString()
                })
                .ToListAsync();

            return Ok(books);
        }

        // 8. حذف كتاب من الكتالوج
        [HttpDelete("books/{id}")]
        public async Task<IActionResult> RemoveBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound("الكتاب غير موجود.");
            }

            _context.Reviews.RemoveRange(book.Reviews);
            _context.Books.Remove(book);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"تم حذف الكتاب '{book.Title}' بنجاح."
            });
        }


        // 9. الموافقة على نشر كتاب جديد
        [HttpPost("books/{id}/approve")]
        public async Task<IActionResult> ApproveBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound(new { message = "Book not found." });
            }

            book.ApprovalStatus = ApprovalStatus.Approved;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Book '{book.Title}' has been approved for publication successfully." });
        }

        // 10. رفض نشر كتاب
        [HttpPost("books/{id}/reject")]
        public async Task<IActionResult> RejectBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound(new { message = "Book not found." });
            }

            book.ApprovalStatus = ApprovalStatus.Rejected;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Book '{book.Title}' publication request has been rejected." });
        }
    }
}