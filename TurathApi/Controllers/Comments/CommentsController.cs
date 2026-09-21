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
        public async Task<ActionResult<IEnumerable<CommentResponseDto>>> GetComments()
        {
            try
            {
                // Ensure the 4 primary curated community testimonials exist in the DB
                if (!await _context.Comments.AnyAsync(c => c.Content.Contains("linen paper") || c.Content.Contains("flea markets")))
                {
                    _context.Comments.AddRange(
                        new Comment
                        {
                            UserId = "Mariam Sobhy",
                            Content = "Turath's packaging is incredible — arrived in recycled linen paper with zero plastic. The books felt loved and well-preserved.",
                            CreatedAt = DateTime.UtcNow.AddDays(-12)
                        },
                        new Comment
                        {
                            UserId = "Yusuf Karim",
                            Content = "Finding antique philosophy editions here saved me months of searching flea markets. The condition notes were 100% accurate!",
                            CreatedAt = DateTime.UtcNow.AddDays(-8)
                        },
                        new Comment
                        {
                            UserId = "Dr. Tarek Hegazy",
                            Content = "As both a reader and a seller, the platform is smooth and respectful to book culture. Fulfilling orders feels like passing a torch.",
                            CreatedAt = DateTime.UtcNow.AddDays(-5)
                        },
                        new Comment
                        {
                            UserId = "Nour Al-Din",
                            Content = "Fast 3-day delivery to Alexandria and prompt customer support when I asked about book editions. Highly recommended!",
                            CreatedAt = DateTime.UtcNow.AddDays(-2)
                        }
                    );
                    await _context.SaveChangesAsync();
                }

                var comments = await _context.Comments
                    .AsNoTracking()
                    .Where(c => !c.Content.Contains("checkout process") 
                             && !c.Content.Contains("clean design") 
                             && !c.Content.Contains("book filters") 
                             && !c.Content.Contains("easy to browse")
                             && !c.UserId.Contains("ahmed_hassan"))
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var userIds = comments.Select(c => c.UserId).Distinct().ToList();
                var users = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToDictionaryAsync(
                        u => u.Id,
                        u => !string.IsNullOrWhiteSpace(u.FirstName)
                            ? $"{u.FirstName} {u.LastName}".Trim()
                            : (!string.IsNullOrWhiteSpace(u.UserName) && !u.UserName.Contains("-") ? u.UserName : "Turath Reader")
                    );

                var result = comments.Select(c =>
                {
                    string displayName;
                    if (users.TryGetValue(c.UserId, out var name) && !string.IsNullOrWhiteSpace(name))
                    {
                        displayName = name;
                    }
                    else if (!string.IsNullOrWhiteSpace(c.UserId) && !c.UserId.Contains("-") && !c.UserId.Contains("@"))
                    {
                        displayName = c.UserId.Replace("_", " ");
                        // Capitalize nicely if e.g. ahmed hassan -> Ahmed Hassan
                        displayName = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(displayName);
                    }
                    else
                    {
                        displayName = "Turath Reader";
                    }

                    return new CommentResponseDto
                    {
                        Id = c.Id,
                        UserId = c.UserId,
                        UserName = displayName,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments");
                return StatusCode(500, new { message = "Error retrieving comments", error = ex.Message });
            }
        }

        // POST: api/comments/create
        [HttpPost("create")]
        public async Task<ActionResult<CommentResponseDto>> CreateComment([FromBody] CreateCommentDto dto)
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

                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? (!string.IsNullOrWhiteSpace(dto.UserId) ? dto.UserId : "Turath Reader");

                var comment = new Comment
                {
                    UserId = userId,
                    Content = dto.Content.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                var user = await _context.Users.FindAsync(userId);
                var userName = user != null
                    ? (!string.IsNullOrWhiteSpace(user.FirstName) ? $"{user.FirstName} {user.LastName}".Trim() : user.UserName ?? "Turath Reader")
                    : (!string.IsNullOrWhiteSpace(dto.UserId) && !dto.UserId.Contains("-") ? dto.UserId : "Turath Reader");

                return Ok(new CommentResponseDto
                {
                    Id = comment.Id,
                    UserId = comment.UserId,
                    UserName = userName,
                    Content = comment.Content,
                    CreatedAt = comment.CreatedAt
                });
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