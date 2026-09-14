using Microsoft.AspNetCore.Mvc;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                status = "OK",
                message = "Turath API is running",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
