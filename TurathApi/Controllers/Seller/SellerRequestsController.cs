using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TurathApi.Data;
using TurathApi.DTOs.SellerRequest;
using TurathApi.Models;

namespace TurathApi.Controllers.Seller
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellerRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public SellerRequestsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // 1. Customer: تقديم طلب تحويل إلى Seller
        [Authorize(Roles = "Customer")]
        [HttpPost("apply")]
        public async Task<IActionResult> ApplyForSeller()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var existingRequest = await _context.SellerRequests
                .FirstOrDefaultAsync(r => r.UserId == userId && r.Status == RequestStatus.Pending);

            if (existingRequest != null)
            {
                return BadRequest(new { message = "You already have a pending seller request." });
            }

            var request = new SellerRequest
            {
                UserId = userId,
                Status = RequestStatus.Pending,
                RequestedAt = DateTime.UtcNow
            };

            _context.SellerRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Seller request submitted successfully." });
        }

        // 2. Admin: عرض جميع الطلبات مع إمكانية التصفية بحسب الحالة
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllRequests([FromQuery] RequestStatus? status)
        {
            var query = _context.SellerRequests.Include(r => r.User).AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            var requests = await query.Select(r => new SellerRequestResponseDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserEmail = r.User!.Email!,
                Status = r.Status.ToString(),
                RequestedAt = r.RequestedAt,
                ProcessedAt = r.ProcessedAt
            }).ToListAsync();

            return Ok(requests);
        }

        // 3. Admin: قبول الطلب وترقية المستخدم إلى Seller
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var request = await _context.SellerRequests.FindAsync(id);
            if (request == null) return NotFound(new { message = "Request not found." });

            if (request.Status != RequestStatus.Pending)
            {
                return BadRequest(new { message = "Request has already been processed." });
            }

            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null) return NotFound(new { message = "User not found." });

            var result = await _userManager.AddToRoleAsync(user, "Seller");
            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Failed to update user role." });
            }

            request.Status = RequestStatus.Approved;
            request.ProcessedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Seller request approved successfully and role updated to Seller." });
        }

        // 4. Admin: رفض الطلب
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            var request = await _context.SellerRequests.FindAsync(id);
            if (request == null) return NotFound(new { message = "Request not found." });

            if (request.Status != RequestStatus.Pending)
            {
                return BadRequest(new { message = "Request has already been processed." });
            }

            request.Status = RequestStatus.Rejected;
            request.ProcessedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Seller request rejected." });
        }
    }
}