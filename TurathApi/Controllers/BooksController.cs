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
        public async Task<ActionResult<IEnumerable<Book>>> GetAll()
        {
            var books = await _context.Books
                .Include(b => b.Category)
                .Where(b => b.ApprovalStatus == ApprovalStatus.Approved)
                .ToListAsync();

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
    }
}
