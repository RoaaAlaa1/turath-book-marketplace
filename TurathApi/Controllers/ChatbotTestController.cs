using Microsoft.AspNetCore.Mvc;
using TurathApi.Services;

namespace TurathApi.Controllers
{
    // Temporary controller for testing the chatbot's stubbed/real tool functions
    // directly in Swagger, before wiring up the actual Claude API integration.
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotTestController : ControllerBase
    {
        private readonly ChatbotToolService _toolService;
        private readonly ILogger<ChatbotTestController> _logger;

        public ChatbotTestController(ChatbotToolService toolService, ILogger<ChatbotTestController> logger)
        {
            _toolService = toolService;
            _logger = logger;
        }

        // GET: api/chatbottest/test-search?query=fantasy&category=Fiction
        [HttpGet("test-search")]
        public async Task<IActionResult> TestSearch(string query, string? category = null)
        {
            try
            {
                var result = await _toolService.SearchBooks(query, category);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing search_books tool");
                return StatusCode(500, new { message = "Error searching books", error = ex.Message });
            }
        }

        
        
    }
}