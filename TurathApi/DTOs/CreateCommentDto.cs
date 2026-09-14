using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
}