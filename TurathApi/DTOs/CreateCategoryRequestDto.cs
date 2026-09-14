using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs
{
    public class CreateCategoryRequestDto
    {
        [Required]
        public string CategoryName { get; set; }
    }
}