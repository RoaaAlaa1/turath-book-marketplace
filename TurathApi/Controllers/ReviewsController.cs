using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.Models;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ReviewsController> _logger;
        
        public ReviewsController(AppDbContext context, ILogger<ReviewsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/reviews/get-all-reviews
        [HttpGet("get-all-reviews")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            try
            {
                var reviews = await _context.Reviews.AsNoTracking().ToListAsync();
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews");
                return StatusCode(500, new { message = "Error retrieving reviews", error = ex.Message });
            }
        }

        // GET: api/reviews/get-review/{id}
        [HttpGet("get-review/{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound(new { message = "Review not found" });
                }

                return Ok(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review with id: {ReviewId}", id);
                return StatusCode(500, new { message = "Error retrieving review", error = ex.Message });
            }
        }

        // GET: api/reviews/book/{bookId}
        [HttpGet("book/{bookId:int}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetReviewsForBook(int bookId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .AsNoTracking()
                    .Where(r => r.BookId == bookId)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                var averageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0;

                return Ok(new
                {
                    BookId = bookId,
                    AverageRating = averageRating,
                    ReviewCount = reviews.Count,
                    Reviews = reviews
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews for book with id: {BookId}", bookId);
                return StatusCode(500, new { message = "Error retrieving reviews for book", error = ex.Message });
            }
        }

        // POST: api/reviews/create
        [HttpPost("create")]
        [Authorize]
        public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewDto dto)
        {
            try
            {
                var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(customerId))
                {
                    return Unauthorized(new { message = "Invalid user identifier" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Invalid review data",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var review = new Review
                {
                    CustomerId = customerId,
                    BookId = dto.BookId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, new { message = "Error creating review", error = ex.Message });
            }
        }

        // PUT: api/reviews/update/{id}
        [HttpPut("update/{id:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto dto)
        {
            try
            {
                var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(customerId))
                {
                    return Unauthorized(new { message = "Invalid user identifier" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Invalid review data",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.CustomerId == customerId);
                if (review == null)
                {
                    return NotFound(new { message = "Review not found or you are not authorized to edit it" });
                }

                review.Rating = dto.Rating;
                review.Comment = dto.Comment;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Review updated successfully", review });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review with id: {ReviewId}", id);
                return StatusCode(500, new { message = "Error updating review", error = ex.Message });
            }
        }

        // DELETE: api/reviews/delete/{id}
        [HttpDelete("delete/{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(customerId))
                {
                    return Unauthorized(new { message = "Invalid user identifier" });
                }

                var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id && r.CustomerId == customerId);
                if (review == null)
                {
                    return NotFound(new { message = "Review not found or you are not authorized to delete it" });
                }

                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review with id: {ReviewId}", id);
                return StatusCode(500, new { message = "Error deleting review", error = ex.Message });
            }
        }
    }
}