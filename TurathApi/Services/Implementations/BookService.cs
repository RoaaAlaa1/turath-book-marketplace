using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs;
using TurathApi.DTOs.Books;
using TurathApi.Models;
using TurathApi.Models.Enums;
using TurathApi.Services.Interfaces;

namespace TurathApi.Services.Implementations
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;

        public BookService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookResponseDto>> GetAllApprovedAsync(string? search, int? categoryId, string? sort)
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

            return await query.Select(b => new BookResponseDto
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
        }

        public async Task<BookResponseDto?> GetByIdAsync(int id)
        {
            var book = await _context.Books
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id && b.ApprovalStatus == ApprovalStatus.Approved);

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

        public async Task<IEnumerable<BookResponseDto>> GetSellerBooksAsync(string sellerId)
        {
            return await _context.Books
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
                }).ToListAsync();
        }

        public async Task<BookResponseDto> CreateBookAsync(CreateBookDto dto, string sellerId)
        {
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
                Title = dto.Title,
                Author = dto.Author,
                Description = dto.Description,
                Price = dto.Price,
                Quantity = dto.Quantity,
                CategoryId = category?.Id ?? 1,
                ImageUrl = dto.ImageUrl,
                Condition = dto.Condition,
                AgeRating = dto.AgeRating,
                SellerId = sellerId,
                ApprovalStatus = ApprovalStatus.Pending
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(book.Id) ?? new BookResponseDto { Id = book.Id, Title = book.Title };
        }

        public async Task<bool> UpdateBookAsync(int id, UpdateBookDto dto, string sellerId)
        {
            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.SellerId == sellerId);

            if (existingBook == null) return false;

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

            existingBook.Title = dto.Title;
            existingBook.Author = dto.Author;
            existingBook.Description = dto.Description;
            existingBook.Condition = dto.Condition;
            existingBook.AgeRating = dto.AgeRating;
            existingBook.Price = dto.Price;
            existingBook.Quantity = dto.Quantity;
            if (category != null)
            {
                existingBook.CategoryId = category.Id;
            }
            existingBook.ImageUrl = dto.ImageUrl;
            existingBook.ApprovalStatus = ApprovalStatus.Pending;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBookAsync(int id, string sellerId)
        {
            var book = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == id && b.SellerId == sellerId);

            if (book == null) return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}