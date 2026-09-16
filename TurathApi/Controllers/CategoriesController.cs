using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/categories
        /// Returns all categories — used to populate the catalog's category filter.
        /// Public — no admin required.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAll()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }

        /// <summary>
        /// GET /api/categories/{name}
        /// Returns a single category by name.
        /// </summary>
        [HttpGet("{name}")]
        public async Task<ActionResult<Category>> GetByName(string name)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == name);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            return Ok(category);
        }

        /// <summary>
        /// POST /api/categories
        /// Admin only. Creates a new category.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Category>> Create([FromBody] CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Category name is required" });
            }

            var nameExists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower());
            if (nameExists)
            {
                return Conflict(new { message = "A category with this name already exists" });
            }

            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByName), new { name = category.Name }, category);
        }

        /// <summary>
        /// PUT /api/categories/{name}
        /// Admin only. Edits an existing category.
        /// </summary>
        [HttpPut("{name}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(string name, [FromBody] CategoryDto dto)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == name);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Category name is required" });
            }

            var nameTaken = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower());
            if (nameTaken)
            {
                return Conflict(new { message = "A category with this name already exists" });
            }

            category.Name = dto.Name;
            category.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Category '{category.Name}' updated successfully.", category });
        }

        /// <summary>
        /// DELETE /api/categories/{name}
        /// Admin only. If the category still has books, returns 409 with the book count
        /// unless confirmDeleteBooks=true is passed, in which case it deletes all books
        /// in the category (and their dependent Reviews/WishlistItems) before deleting
        /// the category itself.
        /// </summary>
        [HttpDelete("{name}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string name, [FromQuery] bool confirmDeleteBooks = false)
        {
            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Name == name);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            var booksInCategory = await _context.Books
                .Where(b => b.Category.Name == name)
                .ToListAsync();

            if (booksInCategory.Count > 0 && !confirmDeleteBooks)
            {
                return Conflict(new
                {
                    message = $"{booksInCategory.Count} book(s) are in this category. Confirm to delete them along with the category.",
                    bookCount = booksInCategory.Count
                });
            }

            if (booksInCategory.Count > 0)
            {
                var bookIds = booksInCategory.Select(b => b.Id).ToList();

                var reviews = await _context.Reviews
                    .Where(r => bookIds.Contains(r.BookId))
                    .ToListAsync();
                _context.Reviews.RemoveRange(reviews);

                var wishlistItems = await _context.WishlistItems
                    .Where(w => bookIds.Contains(w.BookId))
                    .ToListAsync();
                _context.WishlistItems.RemoveRange(wishlistItems);

                _context.Books.RemoveRange(booksInCategory);
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Category '{category.Name}' deleted successfully.",
                booksDeleted = booksInCategory.Count
            });
        }
    }

    public class CategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
