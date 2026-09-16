using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
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
        private readonly AppDbContext _context;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(AppDbContext context, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
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
        public async Task<ActionResult> GetReviewsForBook(int bookId)
        {
            var summary = await _reviewService.GetBookReviewsSummaryAsync(bookId);
            return Ok(summary);
        }

        // POST: api/reviews/create
        [Authorize]
        [HttpPost("create")]
        [Authorize]
        public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewDto dto)
        {
            try
            {
                // Validate DTO
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
                    CustomerId = dto.CustomerId,
                    BookId = dto.BookId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

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

                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound(new { message = "Review not found" });
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
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound(new { message = "Review not found" });
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