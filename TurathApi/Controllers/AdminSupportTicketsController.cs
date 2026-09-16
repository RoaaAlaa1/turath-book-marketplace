using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs.Tickets;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/admin/support-tickets")]
    [Authorize(Roles = "Admin")] // Accessible only for Admins
    public class AdminSupportTicketsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminSupportTicketsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/support-tickets
        // Get all support tickets across the system
        [HttpGet]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _context.SupportTickets
                .Include(t => t.Customer)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Subject,
                    t.Message,
                    t.Status,
                    t.AdminResponse,
                    t.OrderId,
                    CustomerEmail = t.Customer != null ? t.Customer.Email : string.Empty,
                    t.CreatedAt,
                    t.UpdatedAt
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // PUT: api/admin/support-tickets/{id}/status
        // Update ticket status and reply/resolve it
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateTicketStatus(int id, [FromBody] UpdateTicketStatusDto dto)
        {
            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null)
            {
                return NotFound(new { message = "Support ticket not found." });
            }

            ticket.Status = dto.Status;
            ticket.AdminResponse = dto.AdminResponse;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Support ticket #{ticket.Id} status updated successfully to {ticket.Status}." });
        }
    }
}