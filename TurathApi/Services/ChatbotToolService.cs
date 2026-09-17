using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.DTOs.Books;
using TurathApi.Models.Enums;

namespace TurathApi.Services
{
    public class ChatbotToolService
    {
        private readonly AppDbContext _context;

        public ChatbotToolService(AppDbContext context)
        {
            _context = context;
        }

        // 1. Core Tool: Search Approved Books with Filters
        public async Task<IEnumerable<BookResponseDto>> SearchBooks(string? query, string? category = null, decimal? maxPrice = null)
        {
            var dbQuery = _context.Books
                .Include(b => b.Category)
                .AsNoTracking()
                .Where(b => b.ApprovalStatus == ApprovalStatus.Approved && b.Quantity > 0);

            if (!string.IsNullOrWhiteSpace(query))
            {
                var term = query.Trim();
                dbQuery = dbQuery.Where(b =>
                    EF.Functions.Like(b.Title, $"%{term}%") ||
                    EF.Functions.Like(b.Author, $"%{term}%") ||
                    EF.Functions.Like(b.Description, $"%{term}%"));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                dbQuery = dbQuery.Where(b => b.Category != null && b.Category.Name.ToLower() == category.Trim().ToLower());
            }

            if (maxPrice.HasValue)
            {
                dbQuery = dbQuery.Where(b => b.Price <= maxPrice.Value);
            }

            return await dbQuery
                .OrderBy(b => b.Price)
                .Take(10) // Limit context payload size for LLM prompts
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
        }

        // 2. Tool: Get Book Details and Condition by ID
        public async Task<BookResponseDto?> GetBookDetails(int bookId)
        {
            var book = await _context.Books
                .Include(b => b.Category)
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == bookId && b.ApprovalStatus == ApprovalStatus.Approved);

            if (book == null) return null;

            return new BookResponseDto
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
        }

        // 3. Tool: Fetch Reviews & Ratings for Recommendations
        public async Task<BookReviewsSummaryDto?> GetBookReviews(int bookId)
        {
            var bookExists = await _context.Books.AnyAsync(b => b.Id == bookId && b.ApprovalStatus == ApprovalStatus.Approved);
            if (!bookExists) return null;

            var reviews = await _context.Reviews
                .AsNoTracking()
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .ToListAsync();

            var averageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0;

            return new BookReviewsSummaryDto
            {
                BookId = bookId,
                AverageRating = averageRating,
                ReviewCount = reviews.Count,
                Reviews = reviews
            };
        }
    }
}