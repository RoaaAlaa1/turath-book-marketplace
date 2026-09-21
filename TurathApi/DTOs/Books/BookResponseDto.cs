using TurathApi.Models.Enums;

namespace TurathApi.DTOs.Books
{
    public class BookReviewItemDto
    {
        public int Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public float Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class BookResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string SellerId { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public BookCondition Condition { get; set; }
        public string AgeRating { get; set; } = string.Empty;
        public ApprovalStatus ApprovalStatus { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public List<BookReviewItemDto> Reviews { get; set; } = new();
    }
}