using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs.Reviews
{
    public class CreateReviewDto
    {
        [Required]
        public string CustomerId { get; set; } = string.Empty;
        [Required]
        public int BookId { get; set; }

        [Range(1, 5)]
        public float Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;
    }

    public class UpdateReviewDto
    {
        [Range(1, 5)]
        public float Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;
    }
}
