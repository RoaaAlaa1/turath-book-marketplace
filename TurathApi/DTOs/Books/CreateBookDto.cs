using System.ComponentModel.DataAnnotations;
using TurathApi.Models.Enums;

namespace TurathApi.DTOs.Books
{
    public class CreateBookDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Author { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Range(0.01, 100000)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public int? CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public string? SellerId { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public BookCondition Condition { get; set; } = BookCondition.Good;

        public string AgeRating { get; set; } = "All Ages";
    }
}