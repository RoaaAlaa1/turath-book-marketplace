using System.ComponentModel.DataAnnotations;

namespace TurathApi.Models
{
    public class WishlistItem
    {
        public int Id { get; set; }

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public int BookId { get; set; }

        public Book? Book { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}