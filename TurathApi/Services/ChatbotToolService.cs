using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
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

        public async Task<object> SearchBooks(string query, string? category = null)
        {
            var booksQuery = _context.Books
                .AsNoTracking()
                .Include(b => b.Category)
                .Where(b => b.ApprovalStatus == ApprovalStatus.Approved); // never suggest unapproved books

            booksQuery = booksQuery.Where(b =>
                b.Title.Contains(query) ||
                b.Author.Contains(query) ||
                (b.Category != null && b.Category.Name.Contains(query)));

            if (!string.IsNullOrWhiteSpace(category))
            {
                booksQuery = booksQuery.Where(b => b.Category != null && b.Category.Name == category);
            }

            var results = await booksQuery
                .Take(5) // keep chatbot replies short and readable
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Author,
                    Category = b.Category != null ? b.Category.Name : null,
                    b.Price,
                    b.Condition
                })
                .ToListAsync();

            return results;
        }

        
        
    }
}