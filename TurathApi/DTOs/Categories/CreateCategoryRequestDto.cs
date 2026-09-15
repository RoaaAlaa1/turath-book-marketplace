using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs.Categories
{
    public class CreateCategoryRequestDto
    {
        [Required]
        public string CategoryName { get; set; } = string.Empty;
    }
}