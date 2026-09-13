using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestAuthController : ControllerBase
    {
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            return Ok(new
            {
                Message = "Fake Auth Working Successfully!",
                UserId = userId,
                Role = role
            });
        }
    }
}