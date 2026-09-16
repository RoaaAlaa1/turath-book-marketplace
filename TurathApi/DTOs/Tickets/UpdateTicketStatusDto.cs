using System.ComponentModel.DataAnnotations;
using TurathApi.Models.Enums;

namespace TurathApi.DTOs.Tickets
{
    public class UpdateTicketStatusDto
    {
        [Required]
        public TicketStatus Status { get; set; }

        public string? AdminResponse { get; set; }
    }
}