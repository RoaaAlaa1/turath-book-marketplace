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
        /// Returns the public catalog - approved books only.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] string? sort)
        {
            var query = _context.Books
                .Include(b => b.Category)
                .Include(b => b.Seller)
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.Customer)
                .Where(b => b.ApprovalStatus == ApprovalStatus.Approved);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(b =>
                    EF.Functions.Like(b.Title, $"%{term}%") ||
                    EF.Functions.Like(b.Author, $"%{term}%"));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                var categoryTerm = category.Trim();
                query = query.Where(b => b.Category != null && b.Category.Name == categoryTerm);
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
                SellerName = b.Seller != null
                    ? (!string.IsNullOrWhiteSpace(b.Seller.FirstName)
                        ? (b.Seller.FirstName + " " + (b.Seller.LastName ?? "")).Trim()
                        : b.Seller.UserName ?? "Verified Seller")
                    : "Unknown Seller",
                ImageUrl = b.ImageUrl,
                Condition = b.Condition,
                AgeRating = b.AgeRating,
                ApprovalStatus = b.ApprovalStatus,
                AverageRating = b.Reviews.Any() ? Math.Round(b.Reviews.Average(r => (double)r.Rating), 1) : 0,
                ReviewCount = b.Reviews.Count,
                Reviews = b.Reviews.OrderByDescending(r => r.CreatedAt).Select(r => new BookReviewItemDto
                {
                    Id = r.Id,
                    CustomerId = r.CustomerId,
                    CustomerName = r.Customer != null
                        ? (!string.IsNullOrWhiteSpace(r.Customer.FirstName)
                            ? (r.Customer.FirstName + " " + (r.Customer.LastName ?? "")).Trim()
                            : (!string.IsNullOrWhiteSpace(r.Customer.UserName) && !r.Customer.UserName.Contains("-") && !r.Customer.UserName.Contains("@")
                                ? r.Customer.UserName
                                : "Turath Reader"))
                        : "Turath Reader",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
            }).ToListAsync();

            return Ok(books);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookResponseDto>> GetById(int id)
        {
            var book = await _context.Books
                .Include(b => b.Category)
                .Include(b => b.Seller)
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.Customer)
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
                SellerName = book.Seller != null
                    ? (!string.IsNullOrWhiteSpace(book.Seller.FirstName)
                        ? (book.Seller.FirstName + " " + (book.Seller.LastName ?? "")).Trim()
                        : book.Seller.UserName ?? "Verified Seller")
                    : "Unknown Seller",
                ImageUrl = book.ImageUrl,
                Condition = book.Condition,
                AgeRating = book.AgeRating,
                ApprovalStatus = book.ApprovalStatus,
                AverageRating = book.Reviews.Any() ? Math.Round(book.Reviews.Average(r => (double)r.Rating), 1) : 0,
                ReviewCount = book.Reviews.Count,
                Reviews = book.Reviews.OrderByDescending(r => r.CreatedAt).Select(r => new BookReviewItemDto
                {
                    Id = r.Id,
                    CustomerId = r.CustomerId,
                    CustomerName = r.Customer != null
                        ? (!string.IsNullOrWhiteSpace(r.Customer.FirstName)
                            ? (r.Customer.FirstName + " " + (r.Customer.LastName ?? "")).Trim()
                            : (!string.IsNullOrWhiteSpace(r.Customer.UserName) && !r.Customer.UserName.Contains("-") && !r.Customer.UserName.Contains("@")
                                ? r.Customer.UserName
                                : "Turath Reader"))
                        : "Turath Reader",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList()
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
                .Include(b => b.Seller)
                .Where(b => b.SellerId == sellerId && b.ApprovalStatus != ApprovalStatus.Rejected)
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
                    SellerName = b.Seller != null
                        ? (!string.IsNullOrWhiteSpace(b.Seller.FirstName)
                            ? (b.Seller.FirstName + " " + (b.Seller.LastName ?? "")).Trim()
                            : b.Seller.UserName ?? "Verified Seller")
                        : "Unknown Seller",
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
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? dto.SellerId;
            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var sellerExists = await _context.Users.AnyAsync(u => u.Id == sellerId);
            if (!sellerExists)
            {
                var fallbackSeller = await _context.Users.FirstOrDefaultAsync(u => u.Email == "seller@turath.com")
                    ?? await _context.Users.FirstOrDefaultAsync();
                if (fallbackSeller != null)
                {
                    sellerId = fallbackSeller.Id;
                }
            }

            Category? category = null;
            if (dto.CategoryId.HasValue && dto.CategoryId.Value > 0)
            {
                category = await _context.Categories.FindAsync(dto.CategoryId.Value);
            }
            if (category == null && !string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                var norm = dto.CategoryName.Trim().ToLower();
                category = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == norm);
            }
            if (category == null && !string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                category = new Category { Name = dto.CategoryName.Trim() };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
            }
            if (category == null)
            {
                category = await _context.Categories.FirstOrDefaultAsync();
            }

            var book = new Book
            {
                Title = dto.Title.Trim(),
                Author = dto.Author.Trim(),
                Description = dto.Description?.Trim() ?? string.Empty,
                Price = dto.Price,
                Quantity = dto.Quantity,
                CategoryId = category?.Id ?? 1,
                ImageUrl = dto.ImageUrl ?? string.Empty,
                Condition = dto.Condition,
                AgeRating = string.IsNullOrWhiteSpace(dto.AgeRating) ? "All Ages" : dto.AgeRating.Trim(),
                SellerId = sellerId,
                ApprovalStatus = ApprovalStatus.Pending
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = book.Id }, new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Description = book.Description,
                Price = book.Price,
                Quantity = book.Quantity,
                CategoryId = book.CategoryId,
                CategoryName = category?.Name ?? "General",
                SellerId = book.SellerId,
                ImageUrl = book.ImageUrl,
                Condition = book.Condition,
                AgeRating = book.AgeRating,
                ApprovalStatus = book.ApprovalStatus
            });
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Edit(int id, [FromBody] CreateBookDto dto)
        {
            var sellerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? dto.SellerId;
            if (string.IsNullOrEmpty(sellerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && (b.SellerId == sellerId || User.IsInRole("Admin")));

            if (existingBook == null)
            {
                return NotFound(new { message = "Book not found or you do not have permission to edit it." });
            }

            Category? category = null;
            if (dto.CategoryId.HasValue && dto.CategoryId.Value > 0)
            {
                category = await _context.Categories.FindAsync(dto.CategoryId.Value);
            }
            if (category == null && !string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                var norm = dto.CategoryName.Trim().ToLower();
                category = await _context.Categories.FirstOrDefaultAsync(c => c.Name.ToLower() == norm);
            }
            if (category == null && !string.IsNullOrWhiteSpace(dto.CategoryName))
            {
                category = new Category { Name = dto.CategoryName.Trim() };
                _context.Categories.Add(category);
                await _context.SaveChangesAsync();
            }

            existingBook.Title = dto.Title.Trim();
            existingBook.Author = dto.Author.Trim();
            existingBook.Description = dto.Description?.Trim() ?? string.Empty;
            existingBook.Condition = dto.Condition;
            existingBook.AgeRating = string.IsNullOrWhiteSpace(dto.AgeRating) ? "All Ages" : dto.AgeRating.Trim();
            existingBook.Price = dto.Price;
            existingBook.Quantity = dto.Quantity;
            if (category != null)
            {
                existingBook.CategoryId = category.Id;
            }
            existingBook.ImageUrl = dto.ImageUrl ?? string.Empty;
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
                .FirstOrDefaultAsync(b => b.Id == id && (b.SellerId == sellerId || User.IsInRole("Admin")));

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