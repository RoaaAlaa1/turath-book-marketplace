using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs.Tickets
{
    public class CreateSupportTicketDto
    {
        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public Guid? OrderId { get; set; } // Optional order reference
    }
}