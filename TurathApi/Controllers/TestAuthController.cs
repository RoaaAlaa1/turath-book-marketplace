using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TurathApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestAuthController : ControllerBase
    {
        // 1. Endpoint عامة - أي حد يقدر يوصلها من غير تسجيل دخول
        [HttpGet("public")]
        public IActionResult PublicEndpoint()
        {
            return Ok(new { message = "This is a public endpoint, anyone can access it!" });
        }

        // 2. Endpoint محمية - لا يمكن الوصول إليها إلا بـ JWT Token صالحة
        [Authorize]
        [HttpGet("protected")]
        public IActionResult ProtectedEndpoint()
        {
            // استخراج بيانات المستخدم من الـ Claims الموجودة جوه التوكن
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var firstName = User.FindFirst("firstName")?.Value;

            return Ok(new
            {
                message = "Access granted! You are authorized.",
                userId,
                email,
                firstName
            });
        }
    }
}