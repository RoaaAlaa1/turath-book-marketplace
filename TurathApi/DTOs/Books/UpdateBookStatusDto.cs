using System.ComponentModel.DataAnnotations;
using TurathApi.Models.Enums;

namespace TurathApi.DTOs.Books
{
    public class UpdateBookStatusDto
    {
        [Required]
        public ApprovalStatus Status { get; set; }
    }
}