using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs.Books;
using TurathApi.Models;
using TurathApi.Models.Enums;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        // ==================== PUBLIC ENDPOINTS ====================

        /// <summary>
        /// GET /api/books
        /// Returns the public catalog — approved books only.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] string? sort)
        {
            var query = _context.Books
                .Include(b => b.Category)
                .Where(b => b.ApprovalStatus == ApprovalStatus.Approved);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(b =>
                    EF.Functions.Like(b.Title, $"%{term}%") ||
                    EF.Functions.Like(b.Author, $"%{term}%"));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b => b.CategoryId == categoryId.Value);
            }

            query = sort?.Trim().ToLowerInvariant() switch
            {
                "price_asc" => query.OrderBy(b => b.Price),
                "price_desc" => query.OrderByDescending(b => b.Price),
                _ => query.OrderBy(b => b.Id)
            };

            var books = await query.Select(b => new BookResponseDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Description = b.Description,
                Price = b.Price,
                Quantity = b.Quantity,
                CategoryId = b.CategoryId,
                CategoryName = b.Category != null ? b.Category.Name : string.Empty,
                SellerId = b.SellerId,
                ImageUrl = b.ImageUrl,
                Condition = b.Condition,
                AgeRating = b.AgeRating,
                ApprovalStatus = b.ApprovalStatus
            }).ToListAsync();

            return Ok(books);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookResponseDto>> GetById(int id)
        {
            var book = await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book is null || book.ApprovalStatus != ApprovalStatus.Approved)
                return NotFound(new { message = "Book not found." });

            var dto = new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description,
                Price = book.Price,
                Quantity = book.Quantity,
                CategoryId = book.CategoryId,
                CategoryName = book.Category?.Name ?? string.Empty,
                SellerId = book.SellerId,
                ImageUrl = book.ImageUrl,
                Condition = book.Condition,
                AgeRating = book.AgeRating,
                ApprovalStatus = book.ApprovalStatus
            };

            return Ok(dto);
        }

        // ==================== SELLER-OWNED BOOKS (PROTECTED) ====================

        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> GetMyBooks()
        {
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var books = await _context.Books
                .Include(b => b.Category)
                .Where(b => b.SellerId == sellerId)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    Description = b.Description,
                    Price = b.Price,
                    Quantity = b.Quantity,
                    CategoryId = b.CategoryId,
                    CategoryName = b.Category != null ? b.Category.Name : string.Empty,
                    SellerId = b.SellerId,
                    ImageUrl = b.ImageUrl,
                    Condition = b.Condition,
                    AgeRating = b.AgeRating,
                    ApprovalStatus = b.ApprovalStatus
                })
                .ToListAsync();

            return Ok(books);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateBookDto dto)
        {
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Description = dto.Description,
                Price = dto.Price,
                Quantity = dto.Quantity,
                CategoryId = dto.CategoryId,
                ImageUrl = dto.ImageUrl,
                Condition = dto.Condition,
                AgeRating = dto.AgeRating,
                SellerId = sellerId,
                ApprovalStatus = ApprovalStatus.Pending
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Edit(int id, [FromBody] CreateBookDto dto)
        {
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.SellerId == sellerId);

            if (existingBook == null)
            {
                return NotFound(new { message = "Book not found or you do not have permission to edit it." });
            }

            existingBook.Title = dto.Title;
            existingBook.Author = dto.Author;
            existingBook.Description = dto.Description;
            existingBook.Condition = dto.Condition;
            existingBook.AgeRating = dto.AgeRating;
            existingBook.Price = dto.Price;
            existingBook.Quantity = dto.Quantity;
            existingBook.CategoryId = dto.CategoryId;
            existingBook.ImageUrl = dto.ImageUrl;
            existingBook.ApprovalStatus = ApprovalStatus.Pending;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.SellerId == sellerId);

            if (book == null)
            {
                return NotFound(new { message = "Book not found or you do not have permission to delete it." });
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}