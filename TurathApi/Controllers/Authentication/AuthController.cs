using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs.Auth;
using TurathApi.Models;
using TurathApi.Services.Interfaces;

namespace TurathApi.Controllers.Authentication
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;

        public AuthController(IAuthService authService, AppDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(dto);

            if (!result.IsSuccess)
                return Unauthorized(result);

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            var result = await _authService.GetCurrentUserAsync(userId);
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            var latestRequest = await _context.SellerRequests
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.RequestedAt)
                .FirstOrDefaultAsync();

            string sellerState = "none";
            result.Roles ??= new List<string>();
            if (result.Roles.Contains("Seller") || (latestRequest != null && latestRequest.Status == RequestStatus.Approved))
            {
                sellerState = "approved";
                if (!result.Roles.Contains("Seller"))
                {
                    result.Roles.Add("Seller");
                }
            }
            else if (latestRequest != null && latestRequest.Status == RequestStatus.Pending)
            {
                sellerState = "pending";
            }
            else if (latestRequest != null && latestRequest.Status == RequestStatus.Rejected)
            {
                sellerState = "rejected";
            }

            var primaryRole = result.Roles.Contains("Admin")
                ? "admin"
                : (result.Roles.Contains("Seller") ? "seller" : "customer");

            return Ok(new
            {
                id = userId,
                email = result.Email,
                username = result.Username,
                firstName = result.FirstName,
                lastName = result.LastName,
                name = (!string.IsNullOrWhiteSpace(result.FirstName) ? $"{result.FirstName} {result.LastName}".Trim() : result.Username ?? result.Email),
                phoneNumber = result.PhoneNumber,
                roles = result.Roles,
                role = primaryRole,
                sellerState = sellerState,
                token = result.Token
            });
        }
    }
}