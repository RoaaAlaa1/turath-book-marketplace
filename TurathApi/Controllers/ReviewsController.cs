using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TurathApi.DTOs;
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

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET: api/reviews/get-all-reviews
        [HttpGet("get-all-reviews")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            var reviews = await _reviewService.GetAllAsync();
            return Ok(reviews);
        }

        // GET: api/reviews/get-review/{id}
        [HttpGet("get-review/{id:int}")]
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
        public async Task<ActionResult<BookReviewsSummaryDto>> GetReviewsForBook(int bookId)
        {
            var summary = await _reviewService.GetBookReviewsSummaryAsync(bookId);
            return Ok(summary);
        }

        // POST: api/reviews/create
        [Authorize]
        [HttpPost("create")]
        public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Extract the real authenticated customer's ID from JWT token claims
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "Invalid user token claims." });
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
        }

        // PUT: api/reviews/update/{id}
        [Authorize]
        [HttpPut("update/{id:int}")]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var existingReview = await _reviewService.GetByIdAsync(id);

            if (existingReview == null)
            {
                return NotFound(new { message = "Review not found." });
            }

            // Ensure customers can only edit their own reviews (unless user has Admin role)
            if (existingReview.CustomerId != currentUserId && !User.IsInRole("Admin"))
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

        // DELETE: api/reviews/delete/{id}
        [Authorize]
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var existingReview = await _reviewService.GetByIdAsync(id);

            if (existingReview == null)
            {
                return NotFound(new { message = "Review not found." });
            }

            // Ensure customers can only delete their own reviews (unless user has Admin role)
            if (existingReview.CustomerId != currentUserId && !User.IsInRole("Admin"))
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
    }
}