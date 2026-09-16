using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.Models;
using TurathApi.Models.Enums;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Admin only
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;

        public AdminController(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        // ==================== DASHBOARD STATS ====================

        // 0. Get admin dashboard statistics
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var customers = await _userManager.GetUsersInRoleAsync("Customer");
            var sellers = await _userManager.GetUsersInRoleAsync("Seller");

            var stats = new DashboardStatsDto
            {
                TotalCustomers = customers.Count,
                TotalSellers = sellers.Count,
                TotalBooks = await _context.Books.CountAsync(),
                TotalOrders = await _context.Orders.CountAsync(),
                PendingOrders = await _context.Orders.Where(o => o.Status == "Pending").CountAsync(), // تعديل المقارنة لنص
                PendingBookApprovals = await _context.Books.Where(b => b.ApprovalStatus == ApprovalStatus.Pending).CountAsync(),
                PendingCategoryApprovals = await _context.CategoryRequests.Where(r => r.Status == "pending").CountAsync()
            };

            return Ok(stats);
        }

        // ==================== USER MANAGEMENT ====================

        // 1. List all users
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

        // 2. Suspend / activate a user account (Toggle Suspend/Activate)
        [HttpPut("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            await _userManager.SetLockoutEnabledAsync(user, true);

            var isCurrentlySuspended = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;

            if (isCurrentlySuspended)
            {
                await _userManager.SetLockoutEndDateAsync(user, null);
                return Ok(new { message = $"User {user.UserName} has been activated successfully." });
            }
            else
            {
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
                return Ok(new { message = $"User {user.UserName} has been suspended successfully." });
            }
        }

        // ==================== CATEGORY REQUESTS MANAGEMENT ====================

        // 3. List all pending category requests
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

        // 4. Approve a category request and automatically add it to the active categories list
        [HttpPost("category-requests/{id}/approve")]
        public async Task<IActionResult> ApproveCategoryRequest(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound("Request not found.");
            }

            request.Status = "Approved";

            var newCategory = new Category
            {
                Name = request.CategoryName
            };

            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Category '{request.CategoryName}' has been approved and added successfully." });
        }

        // 5. Reject a category request
        [HttpPost("category-requests/{id}/reject")]
        public async Task<IActionResult> RejectCategoryRequest(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null)
            {
                return NotFound("Request not found.");
            }

            request.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Category request '{request.CategoryName}' has been rejected." });
        }

        // ==================== BOOK APPROVAL QUEUE ====================

        // 6. List books pending admin approval
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

        // 7. List all books for the admin
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

        // 8. Remove a book from the catalog
        [HttpDelete("books/{id}")]
        public async Task<IActionResult> RemoveBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound(new { message = "Book not found." });
            }

            var wishlistItems = await _context.WishlistItems
                .Where(w => w.BookId == id)
                .ToListAsync();
            _context.WishlistItems.RemoveRange(wishlistItems);

            _context.Reviews.RemoveRange(book.Reviews);
            _context.Books.Remove(book);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Book '{book.Title}' has been deleted successfully."
            });
        }

        // 9. Approve publication of a new book
        [HttpPost("books/{id}/approve")]
        public async Task<IActionResult> ApproveBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound("Book not found.");
            }

            book.ApprovalStatus = ApprovalStatus.Approved;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Book '{book.Title}' has been approved successfully." });
        }

        // 10. Reject publication of a book
        [HttpPost("books/{id}/reject")]
        public async Task<IActionResult> RejectBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound("Book not found.");
            }

            book.ApprovalStatus = ApprovalStatus.Rejected;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Book '{book.Title}' has been rejected." });
        }
    }
}
