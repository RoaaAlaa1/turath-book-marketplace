using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TurathApi.Models
{
    public class CategoryRequest
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid SellerId { get; set; }

        [ForeignKey("SellerId")]
        public User? Seller { get; set; }

        [Required]
        public string CategoryName { get; set; }

        public string Status { get; set; } = "pending";

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}