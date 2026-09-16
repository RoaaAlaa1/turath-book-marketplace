using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TurathApi.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(450)]
        [Column("customer_id")]
        public string CustomerId { get; set; } = string.Empty;
        public ApplicationUser? Customer { get; set; }

        public int BookId { get; set; }
        public Book? Book { get; set; }

        [Range(1, 5)]
        public float Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}