using Microsoft.AspNetCore.Mvc;
using TurathApi.Services;

namespace TurathApi.Controllers.Chatbot
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly ChatbotService _chatbotService;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(ChatbotService chatbotService, ILogger<ChatbotController> logger)
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