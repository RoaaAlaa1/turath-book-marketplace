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
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book is null || book.ApprovalStatus != ApprovalStatus.Approved)
                return NotFound();

            return Ok(book);
        }

        // ---------------------------------------------------------------
        // SELLER-OWNED BOOKS
        // NOTE: sellerId is hardcoded for now — swap for the authenticated
        // user's id once auth is wired up.
        // ---------------------------------------------------------------

        /// <summary>
        /// GET /api/books/mine
        /// View the seller's own books (any approval status).
        /// </summary>
        [HttpGet("mine")]
        public async Task<IActionResult> GetMyBooks()
        {
            const int sellerId = 1;

            var books = await _context.Books
                .Where(b => b.SellerId == sellerId)
                .ToListAsync();

            return Ok(books);
        }

        /// <summary>
        /// POST /api/books
        /// Add a new book (goes in as Pending).
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create(Book book)
        {
            const int sellerId = 1;

            book.SellerId = sellerId;
            book.ApprovalStatus = ApprovalStatus.Pending;

            _context.Books.Add(book);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMyBooks),
                null,
                book);
        }

        /// <summary>
        /// PUT /api/books/{id}
        /// Edit the seller's own book.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Edit(int id, Book book)
        {
            const int sellerId = 1;

            var existingBook = await _context.Books
                .FirstOrDefaultAsync(
                    b => b.Id == id && b.SellerId == sellerId);

            if (existingBook == null)
            {
                return NotFound();
            }

            existingBook.Title = book.Title;
            existingBook.Author = book.Author;
            existingBook.Description = book.Description;
            existingBook.Condition = book.Condition;
            existingBook.AgeRating = book.AgeRating;
            existingBook.Price = book.Price;
            existingBook.Quantity = book.Quantity;
            existingBook.CategoryId = book.CategoryId;
            existingBook.ImageUrl = book.ImageUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// DELETE /api/books/{id}
        /// Delete the seller's own book.
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            const int sellerId = 1;

            var book = await _context.Books
                .FirstOrDefaultAsync(
                    b => b.Id == id && b.SellerId == sellerId);

            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}