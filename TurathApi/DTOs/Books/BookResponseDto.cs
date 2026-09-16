using TurathApi.Models.Enums;

namespace TurathApi.DTOs.Books
{
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
    }
}