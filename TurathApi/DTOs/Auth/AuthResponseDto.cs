namespace TurathApi.DTOs.Auth
{
    public class AuthResponseDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public DateTime? ExpiresOn { get; set; }
        public string? Email { get; set; }
        public string? Username { get; set; }
        public List<string>? Roles { get; set; }
    }
}