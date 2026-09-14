using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
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

        /// <summary>
        /// GET /api/books
        /// Returns the public catalog — approved books only.
        /// Supports optional query params:
        ///   ?search=term        matches title or author (case-insensitive, partial match)
        ///   ?categoryId=2       restricts to one category
        ///   ?sort=price_asc     or price_desc — sorts by price
        /// Example: /api/books?search=clean&categoryId=2&sort=price_desc
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetAll(
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

            var books = await query.ToListAsync();

            return Ok(books);
        }

        /// <summary>
        /// GET /api/books/{id}
        /// Returns full details for a single book.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Book>> GetById(int id)
        {
            var book = await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book is null || book.ApprovalStatus != ApprovalStatus.Approved)
                return NotFound();

            return Ok(book);
        }
    }
}
