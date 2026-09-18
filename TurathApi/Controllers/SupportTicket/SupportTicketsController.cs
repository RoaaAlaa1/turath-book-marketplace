using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.DTOs.Tickets;
using TurathApi.Models;

namespace TurathApi.Controllers.SupportTicket
{
    [ApiController]
    [Route("api/support-tickets")]
    [Authorize]
    public class SupportTicketsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupportTicketsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/support-tickets
        // Returns all tickets submitted by the currently logged-in customer
        [HttpGet]
        public async Task<IActionResult> GetMyTickets()
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var tickets = await _context.SupportTickets
                .Where(t => t.CustomerId == customerId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.Subject,
                    t.Message,
                    t.Status,
                    t.AdminResponse,
                    t.OrderId,
                    t.CreatedAt,
                    t.UpdatedAt
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // POST: api/support-tickets
        // Allows a customer to create a new support ticket
        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] CreateSupportTicketDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var ticket = new SupportTicket
            {
                CustomerId = customerId,
                Subject = dto.Subject,
                Message = dto.Message,
                OrderId = dto.OrderId,
                Status = Models.Enums.TicketStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Support ticket submitted successfully.", ticketId = ticket.Id });
        }
    }
}