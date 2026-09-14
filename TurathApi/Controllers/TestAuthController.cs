using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TurathApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestAuthController : ControllerBase
    {
        // 1. متاح لأي مستخدم يحمل دور Customer
        [Authorize(Roles = "Customer")]
        [HttpGet("customer-only")]
        public IActionResult CustomerEndpoint()
        {
            return Ok(new { message = "Welcome Customer! You have access to this endpoint." });
        }

        // 2. متاح فقط للـ Seller
        [Authorize(Roles = "Seller")]
        [HttpGet("seller-only")]
        public IActionResult SellerEndpoint()
        {
            return Ok(new { message = "Welcome Seller! You can manage your books here." });
        }

        // 3. متاح فقط للـ Admin
        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminEndpoint()
        {
            return Ok(new { message = "Welcome Admin! System full access granted." });
        }
    }
}