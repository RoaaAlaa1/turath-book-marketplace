using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs.Wishlist;
using TurathApi.Models;

namespace TurathApi.Controllers.Wishlist
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<WishlistController> _logger;

        public WishlistController(AppDbContext context, ILogger<WishlistController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private string? CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET: api/wishlist
        // Dedicated wishlist page - returns all books the current customer has saved.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishlistItemDto>>> GetMyWishlist()
        {
            var userId = CurrentUserId;
            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var items = await _context.WishlistItems
                    .AsNoTracking()
                    .Where(w => w.CustomerId == userId)
                    .Include(w => w.Book)
                    .OrderByDescending(w => w.AddedAt)
                    .Select(w => new WishlistItemDto
                    {
                        Id = w.Id,
                        BookId = w.BookId,
                        Title = w.Book!.Title,
                        Author = w.Book.Author,
                        ImageUrl = w.Book.ImageUrl,
                        Price = w.Book.Price,
                        AddedAt = w.AddedAt
                    })
                    .ToListAsync();

                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving wishlist for user {UserId}", userId);
                return StatusCode(500, new { message = "Error retrieving wishlist", error = ex.Message });
            }
        }

        // POST: api/wishlist/add
        [HttpPost("add")]
        public async Task<ActionResult> AddToWishlist([FromBody] AddWishlistItemDto dto)
        {
            var userId = CurrentUserId;
            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var bookExists = await _context.Books.AnyAsync(b => b.Id == dto.BookId);
                if (!bookExists)
                {
                    return NotFound(new { message = "Book not found" });
                }

                var alreadyExists = await _context.WishlistItems
                    .AnyAsync(w => w.CustomerId == userId && w.BookId == dto.BookId);

                if (alreadyExists)
                {
                    return Conflict(new { message = "Book is already in your wishlist" });
                }

                var item = new WishlistItem
                {
                    CustomerId = userId,
                    BookId = dto.BookId,
                    AddedAt = DateTime.UtcNow
                };

                _context.WishlistItems.Add(item);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Book added to wishlist" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding book {BookId} to wishlist for user {UserId}", dto.BookId, userId);
                return StatusCode(500, new { message = "Error adding to wishlist", error = ex.Message });
            }
        }

        // DELETE: api/wishlist/remove/{bookId}
        [HttpDelete("remove/{bookId:int}")]
        public async Task<ActionResult> RemoveFromWishlist(int bookId)
        {
            var userId = CurrentUserId;
            if (userId == null)
            {
                return Unauthorized();
            }

            try
            {
                var item = await _context.WishlistItems
                    .FirstOrDefaultAsync(w => w.CustomerId == userId && w.BookId == bookId);

                if (item == null)
                {
                    return NotFound(new { message = "Book not found in your wishlist" });
                }

                _context.WishlistItems.Remove(item);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Book removed from wishlist" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing book {BookId} from wishlist for user {UserId}", bookId, userId);
                return StatusCode(500, new { message = "Error removing from wishlist", error = ex.Message });
            }
        }
    }
}