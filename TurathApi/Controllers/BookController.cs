using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllersلآ
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Book
        // View seller's own books
        [HttpGet]
        public async Task<IActionResult> GetMyBooks()
        {
            var sellerId = Guid.Parse("414c784b-4c47-4684-838c-22a905580d64");

            var books = await _context.Books
                .Where(b => b.SellerId == sellerId)
                .ToListAsync();

            return Ok(books);
        }

        // POST: api/Book
        // Add a new book
        [HttpPost]
        public async Task<IActionResult> Create(Book book)
        {
            var sellerId = Guid.Parse("414c784b-4c47-4684-838c-22a905580d64");

            book.Id = Guid.NewGuid();
            book.SellerId = sellerId;
            book.ApprovalStatus = "pending";

            _context.Books.Add(book);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
              nameof(GetMyBooks),
              null,
              book);
        }

        // PUT: api/Book/{id}
        // Edit seller's own book
        [HttpPut("{id}")]
        public async Task<IActionResult> Edit(Guid id, Book book)
        {
            var sellerId = Guid.Parse("414c784b-4c47-4684-838c-22a905580d64");

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

        // DELETE: api/Book/{id}
        // Delete seller's own book
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var sellerId = Guid.Parse("414c784b-4c47-4684-838c-22a905580d64");

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
