using TurathApi.Models.Enums;

namespace TurathApi.Models
{
    /// <summary>
    /// A used-book listing shown to customers.
    /// </summary>
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

        /// <summary>
        /// FK to the future Users/Sellers table (owned by Person 1 / Person 4).
        /// Kept as a plain id — no navigation property — until that model exists,
        /// same pattern already used for Review.BookId before Book existed.
        /// </summary>
        public int SellerId { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public BookCondition Condition { get; set; }

        /// <summary>Recommended minimum reader age, e.g. "12+", "18+", "All Ages".</summary>
        public string AgeRating { get; set; } = "All Ages";

        /// <summary>
        /// Copyright/authorization gate. Only "Approved" books should ever be
        /// returned to customers — enforced in BooksController, not just here.
        /// </summary>
        public ApprovalStatus ApprovalStatus { get; set; }
    }
}
