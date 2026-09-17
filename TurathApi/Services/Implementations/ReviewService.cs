using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.DTOs.Reviews;
using TurathApi.Models;
using TurathApi.Services.Interfaces;

namespace TurathApi.Services.Implementations
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Review>> GetAllAsync()
        {
            return await _context.Reviews
                .AsNoTracking()
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<BookReviewsSummaryDto> GetBookReviewsSummaryAsync(int bookId)
        {
            var reviews = await _context.Reviews
                .AsNoTracking()
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt)
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

        public async Task<Review> AddReviewAsync(CreateReviewDto dto)
        {
            // Verify book exists before attaching review
            var bookExists = await _context.Books.AnyAsync(b => b.Id == dto.BookId);
            if (!bookExists)
            {
                throw new ArgumentException($"Book with ID {dto.BookId} does not exist.");
            }

            var review = new Review
            {
                CustomerId = dto.CustomerId,
                BookId = dto.BookId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return review;
        }

        public async Task<bool> UpdateReviewAsync(int id, UpdateReviewDto dto)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return false;
            }

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteReviewAsync(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return false;
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}