using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TurathApi.DTOs.Auth;
using TurathApi.Models;
using TurathApi.Services.Interfaces;

namespace TurathApi.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "User with this email already exists."
                };
            }

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = errors
                };
            }

            // إضافة دور Customer الافتراضي للمستخدم الجديد
            await _userManager.AddToRoleAsync(user, "Customer");

            // توليد الـ Token للمستخدم بعد التسجيل
            var token = await GenerateJwtTokenAsync(user);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Registration successful.",
                Token = token.Token,
                ExpiresOn = token.ExpiresOn,
                Email = user.Email,
                Username = user.UserName
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                // المعيار الأمني: إرجاع تلميح مبهم لمنع الـ Enumeration Attack
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Invalid credentials."
                };
            }

            var token = await GenerateJwtTokenAsync(user);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Login successful.",
                Token = token.Token,
                ExpiresOn = token.ExpiresOn,
                Email = user.Email,
                Username = user.UserName
            };
        }

        private async Task<(string Token, DateTime ExpiresOn)> GenerateJwtTokenAsync(ApplicationUser user)
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            };

            foreach (var role in userRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var durationInDays = Convert.ToDouble(jwtSettings["DurationInDays"]);
            var expiresOn = DateTime.UtcNow.AddDays(durationInDays);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: expiresOn,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresOn);
        }
    }
}