using TurathApi.Models.Enums;

namespace TurathApi.Models
{
    public class Book
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Author { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public int CategoryId { get; set; }

        public Category? Category { get; set; }

        public string SellerId { get; set; } = string.Empty;
        public ApplicationUser? Seller { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public BookCondition Condition { get; set; }

        public string AgeRating { get; set; } = "All Ages";

        public ApprovalStatus ApprovalStatus { get; set; }

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

    }
}
