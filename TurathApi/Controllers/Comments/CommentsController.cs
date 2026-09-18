using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;
using Microsoft.AspNetCore.Mvc;
using TurathApi.DTOs.Comments;

namespace TurathApi.Controllers.Comments
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(AppDbContext context, ILogger<CommentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/comments/get-all-comments
        // Used by the landing page to display feedback
        [HttpGet("get-all-comments")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments()
        {
            try
            {
                var comments = await _context.Comments
                    .AsNoTracking()
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                return Ok(comments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments");
                return StatusCode(500, new { message = "Error retrieving comments", error = ex.Message });
            }
        }

        // POST: api/comments/create
        [HttpPost("create")]
        public async Task<ActionResult<Comment>> CreateComment([FromBody] CreateCommentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Invalid comment data",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var comment = new Comment
                {
                    UserId = dto.UserId,
                    Content = dto.Content,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                return Ok(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment");
                return StatusCode(500, new { message = "Error creating comment", error = ex.Message });

            }

        }

        // PUT: api/comments/update/{id}
        [HttpPut("update/{id:int}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Invalid comment data",
                        errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }

                var comment = await _context.Comments.FindAsync(id);
                if (comment == null)
                {
                    return NotFound(new { message = "Comment not found" });
                }

                comment.Content = dto.Content;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Comment updated successfully", comment });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment with id: {CommentId}", id);
                return StatusCode(500, new { message = "Error updating comment", error = ex.Message });
            }
        }

        // DELETE: api/comments/delete/{id}
        [HttpDelete("delete/{id:int}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                var comment = await _context.Comments.FindAsync(id);
                if (comment == null)
                {
                    return NotFound(new { message = "Comment not found" });
                }

                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment with id: {CommentId}", id);
                return StatusCode(500, new { message = "Error deleting comment", error = ex.Message });
            }
        }
    }
}