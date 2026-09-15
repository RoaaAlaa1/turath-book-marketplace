using TurathApi.DTOs;
using TurathApi.DTOs.Books;

namespace TurathApi.Services.Interfaces
{
    public interface IBookService
    {
        Task<IEnumerable<BookResponseDto>> GetAllApprovedAsync(string? search, int? categoryId, string? sort);
        Task<BookResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<BookResponseDto>> GetSellerBooksAsync(string sellerId);
        Task<BookResponseDto> CreateBookAsync(CreateBookDto dto, string sellerId);
        Task<bool> UpdateBookAsync(int id, UpdateBookDto dto, string sellerId);
        Task<bool> DeleteBookAsync(int id, string sellerId);
    }
}