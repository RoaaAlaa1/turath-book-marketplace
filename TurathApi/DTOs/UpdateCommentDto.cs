using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs
{
    public class UpdateCommentDto
    {
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
}