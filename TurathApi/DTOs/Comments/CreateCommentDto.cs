using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs.Comments
{
    public class CreateCommentDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;
    }
}