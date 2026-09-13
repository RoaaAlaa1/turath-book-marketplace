using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TurathApi.Models
{
    public class Book
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid SellerId { get; set; }

        [ForeignKey("SellerId")]
        public User? Seller { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Author { get; set; }

        public string Description { get; set; }

        public string Condition { get; set; }

        public string AgeRating { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public string ImageUrl { get; set; }

        public string ApprovalStatus { get; set; } = "pending";
    }
}
