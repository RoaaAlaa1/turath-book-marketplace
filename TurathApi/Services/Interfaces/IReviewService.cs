using TurathApi.DTOs;
using TurathApi.DTOs.Reviews;
using TurathApi.Models;

namespace TurathApi.Services.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<Review>> GetAllAsync();
        Task<Review?> GetByIdAsync(int id);
        Task<BookReviewsSummaryDto> GetBookReviewsSummaryAsync(int bookId); // <-- Change Task<object> to Task<BookReviewsSummaryDto>
        Task<Review> AddReviewAsync(CreateReviewDto dto);
        Task<bool> UpdateReviewAsync(int id, UpdateReviewDto dto);
        Task<bool> DeleteReviewAsync(int id);
    }
}