using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SellerRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<SellerRequestsController> _logger;

        public SellerRequestsController(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<SellerRequestsController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        // GET: /api/SellerRequests?status=Pending
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            try
            {
                var query = _context.SellerRequests
                    .Include(r => r.User)
                    .AsNoTracking()
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<RequestStatus>(status, true, out var parsedStatus))
                {
                    query = query.Where(r => r.Status == parsedStatus);
                }

                var list = await query
                    .OrderByDescending(r => r.RequestedAt)
                    .Select(r => new
                    {
                        id = r.Id,
                        userId = r.UserId,
                        userEmail = r.User != null ? r.User.Email : r.UserId,
                        userName = r.User != null
                            ? (!string.IsNullOrWhiteSpace(r.User.FirstName)
                                ? $"{r.User.FirstName} {r.User.LastName}".Trim()
                                : r.User.UserName ?? "Applicant")
                            : "Applicant",
                        status = r.Status.ToString(),
                        requestedAt = r.RequestedAt,
                        processedAt = r.ProcessedAt
                    })
                    .ToListAsync();

                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching seller requests");
                return StatusCode(500, new { message = "Error retrieving seller requests." });
            }
        }

        // POST: /api/SellerRequests/{id}/approve
        [HttpPost("{id:int}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            try
            {
                var request = await _context.SellerRequests
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (request == null)
                {
                    return NotFound(new { message = "Seller request not found." });
                }

                request.Status = RequestStatus.Approved;
                request.ProcessedAt = DateTime.UtcNow;

                var user = request.User 
                    ?? await _userManager.FindByIdAsync(request.UserId) 
                    ?? await _userManager.FindByEmailAsync(request.UserId);

                if (user != null)
                {
                    if (!await _userManager.IsInRoleAsync(user, "Seller"))
                    {
                        await _userManager.AddToRoleAsync(user, "Seller");
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Seller request approved successfully and user granted Seller role." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving seller request {Id}", id);
                return StatusCode(500, new { message = "Failed to approve seller request." });
            }
        }

        // POST: /api/SellerRequests/{id}/reject
        [HttpPost("{id:int}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            try
            {
                var request = await _context.SellerRequests.FindAsync(id);
                if (request == null)
                {
                    return NotFound(new { message = "Seller request not found." });
                }

                request.Status = RequestStatus.Rejected;
                request.ProcessedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Seller request rejected." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting seller request {Id}", id);
                return StatusCode(500, new { message = "Failed to reject seller request." });
            }
        }

        // POST: /api/SellerRequests/apply
        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromBody] ApplySellerDto? dto = null)
        {
            try
            {
                ApplicationUser? user = null;
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!string.IsNullOrWhiteSpace(currentUserId))
                {
                    user = await _userManager.FindByIdAsync(currentUserId);
                }

                if (user == null && !string.IsNullOrWhiteSpace(dto?.UserId))
                {
                    user = await _userManager.FindByIdAsync(dto.UserId) ?? await _userManager.FindByEmailAsync(dto.UserId);
                }

                if (user == null && !string.IsNullOrWhiteSpace(dto?.Email))
                {
                    user = await _userManager.FindByEmailAsync(dto.Email) ?? await _userManager.FindByNameAsync(dto.Email);
                }

                if (user == null)
                {
                    return BadRequest(new { message = "Could not find a registered account for this seller request. Please ensure you are registered." });
                }

                var existing = await _context.SellerRequests
                    .FirstOrDefaultAsync(r => r.UserId == user.Id && r.Status == RequestStatus.Pending);

                if (existing != null)
                {
                    return Ok(new { message = "Seller request already submitted and pending review." });
                }

                var request = new SellerRequest
                {
                    UserId = user.Id,
                    Status = RequestStatus.Pending,
                    RequestedAt = DateTime.UtcNow
                };

                _context.SellerRequests.Add(request);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Seller request submitted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting seller application");
                return StatusCode(500, new { message = "Failed to submit seller application: " + ex.Message });
            }
        }
    }

    public class ApplySellerDto
    {
        public string? UserId { get; set; }
        public string? Email { get; set; }
        public string? StoreName { get; set; }
        public string? Bio { get; set; }
    }
}
