using Microsoft.AspNetCore.Mvc;
using TurathApi.Services;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ChatbotService _chatbotService;
        private readonly ILogger<ChatController> _logger;

        public ChatController(ChatbotService chatbotService, ILogger<ChatController> logger)
        {
            _chatbotService = chatbotService;
            _logger = logger;
        }

        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequestDto dto)
        {
            try
            {
                var reply = await _chatbotService.GetReplyAsync(dto.Message);
                return Ok(new { reply });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chatbot reply");
                return StatusCode(500, new { message = "Chatbot error", error = ex.Message });
            }
        }
    }

    public class ChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
    }
}