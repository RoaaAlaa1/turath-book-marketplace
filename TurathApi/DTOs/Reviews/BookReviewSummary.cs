using TurathApi.Models;

namespace TurathApi.DTOs
{
    public class BookReviewsSummaryDto
    {
        public int BookId { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public IEnumerable<Review> Reviews { get; set; } = new List<Review>();
    }
}