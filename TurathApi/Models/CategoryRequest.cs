using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TurathApi.Models
{
    public class CategoryRequest
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string SellerId { get; set; } = string.Empty;

        [Required]
        public string CategoryName { get; set; } = string.Empty;

        public string Status { get; set; } = "pending";

        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}