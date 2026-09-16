using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TurathApi.DTOs.Reviews;
using TurathApi.Models;
using TurathApi.Services.Interfaces;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        // GET: api/reviews/get-all-reviews
        [HttpGet("get-all-reviews")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            var reviews = await _reviewService.GetAllAsync();
            return Ok(reviews);
        }

        // GET: api/reviews/get-review/{id}
        [HttpGet("get-review/{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _reviewService.GetByIdAsync(id);
            if (review == null)
            {
                return NotFound(new { message = "Review not found." });
            }

            return Ok(review);
        }

        // GET: api/reviews/book/{bookId}
        [HttpGet("book/{bookId:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<BookReviewsSummaryDto>> GetReviewsForBook(int bookId)
        {
            var summary = await _reviewService.GetBookReviewsSummaryAsync(bookId);
            return Ok(summary);
        }

        // POST: api/reviews/create
        [HttpPost("create")]
        [Authorize]
        public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Invalid review data",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }

                dto.CustomerId = currentUserId;
            try
            {
                var createdReview = await _reviewService.AddReviewAsync(dto);
                return CreatedAtAction(nameof(GetReview), new { id = createdReview.Id }, createdReview);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a review.");
                return StatusCode(500, new { message = "An internal server error occurred." });
            }
        }

        // PUT: api/reviews/update/{id}
        [HttpPut("update/{id:int}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Invalid review data",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var review = await _reviewService.GetByIdAsync(id);
                if (review == null)
                {
                    return NotFound(new { message = "Review not found." });
                }

                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }

                // Ensure customers can only edit their own reviews (unless user has Admin role)
                if (review.CustomerId != currentUserId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var updated = await _reviewService.UpdateReviewAsync(id, dto);
                if (!updated)
                {
                    return StatusCode(500, new { message = "Failed to update review." });
                }

                return Ok(new { message = "Review updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating review {ReviewId}.", id);
                return StatusCode(500, new { message = "An internal server error occurred." });
            }
        }

        // DELETE: api/reviews/delete/{id}
        [HttpDelete("delete/{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var review = await _reviewService.GetByIdAsync(id);
                
                if (review == null)
                {
                    return NotFound(new { message = "Review not found." });
                }

                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }

                // Ensure customers can only delete their own reviews (unless user has Admin role)
                if (review.CustomerId != currentUserId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                var deleted = await _reviewService.DeleteReviewAsync(id);
                if (!deleted)
                {
                    return StatusCode(500, new { message = "Failed to delete review." });
                }

                return Ok(new { message = "Review deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting review {ReviewId}.", id);
                return StatusCode(500, new { message = "An internal server error-occurred." });
            }
        }
    }
}
