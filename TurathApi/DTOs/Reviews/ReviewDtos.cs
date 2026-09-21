using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs.Reviews
{
    public class CreateReviewDto
    {
        public string? CustomerId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public float Rating { get; set; }

        [Required(ErrorMessage = "Comment is required.")]
        [MaxLength(2000, ErrorMessage = "Comment cannot exceed 2000 characters.")]
        public string Comment { get; set; } = string.Empty;
    }

    public class UpdateReviewDto
    {
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public float Rating { get; set; }

        [Required(ErrorMessage = "Comment is required.")]
        [MaxLength(2000, ErrorMessage = "Comment cannot exceed 2000 characters.")]
        public string Comment { get; set; } = string.Empty;
    }
}