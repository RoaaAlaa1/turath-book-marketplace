
using System.ComponentModel.DataAnnotations;

namespace TurathApi.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; }

        [Required]
        public string Status { get; set; }
    }
}
