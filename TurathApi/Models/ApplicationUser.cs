using Microsoft.AspNetCore.Identity;

namespace TurathApi.Models
{
    // بنورث من IdentityUser عشان ناخد مميزات Security جاهزة زي Hashing, Email Confirmation, Lockout Count
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}