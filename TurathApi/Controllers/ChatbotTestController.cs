using Microsoft.AspNetCore.Mvc;
using TurathApi.Services;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotTestController : ControllerBase
    {
        private readonly ChatbotToolService _toolService;

        public ChatbotTestController(ChatbotToolService toolService)
        {
            _toolService = toolService;
        }

        // GET: api/ChatbotTest/test-search?query=Code&category=Science+%26+Technology&maxPrice=300
        [HttpGet("test-search")]
        public async Task<IActionResult> TestSearch(
            [FromQuery] string? query,
            [FromQuery] string? category = null,
            [FromQuery] decimal? maxPrice = null)
        {
            var results = await _toolService.SearchBooks(query, category, maxPrice);
            return Ok(results);
        }

        // GET: api/ChatbotTest/test-book-details/1
        [HttpGet("test-book-details/{id:int}")]
        public async Task<IActionResult> TestBookDetails(int id)
        {
            var result = await _toolService.GetBookDetails(id);
            return result == null ? NotFound(new { message = "Book not found or unapproved." }) : Ok(result);
        }
    }
}