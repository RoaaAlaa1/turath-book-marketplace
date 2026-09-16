using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TurathApi.Models.Enums;

namespace TurathApi.Models
{
    public class SupportTicket
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [ForeignKey("CustomerId")]
        public ApplicationUser? Customer { get; set; }

        // Optional: linking the ticket to a specific order if applicable
        public Guid? OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public TicketStatus Status { get; set; } = TicketStatus.Pending;

        // Admin or Support response notes
        public string? AdminResponse { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}