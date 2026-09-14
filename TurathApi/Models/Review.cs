using System.ComponentModel.DataAnnotations;

namespace TurathApi.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Range(1, 5)]
        public float Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    }
}
