using System.ComponentModel.DataAnnotations;


namespace TurathApi.Models
{
    public class Category
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; }
    }
}
