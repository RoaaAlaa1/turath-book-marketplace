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

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviews()
        {
            var reviews = await _context.Reviews.AsNoTracking().ToListAsync();
            return Ok(reviews);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Review>> GetReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { message = "Review not found" });
            }

            return Ok(review);
        }

        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview(CreateReviewDto dto)
        {
            var review = new Review
            {
                CustomerId = dto.CustomerId,
                BookId = dto.BookId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateReview(int id, UpdateReviewDto dto)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { message = "Review not found" });
            }

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;

            await _context.SaveChangesAsync();
            return Ok(review);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { message = "Review not found" });
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
