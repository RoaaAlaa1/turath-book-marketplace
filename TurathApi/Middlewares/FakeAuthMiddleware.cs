using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;

namespace TurathApi.Middlewares
{
    public class FakeAuthMiddleware
    {
        private readonly RequestDelegate _next;

        public FakeAuthMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var userId = context.Request.Headers["X-User-Id"].ToString();
            var role = context.Request.Headers["X-User-Role"].ToString();

            if (string.IsNullOrEmpty(userId))
            {
                userId = "11111111-1111-1111-1111-111111111111";
            }

            if (string.IsNullOrEmpty(role))
            {
                role = "customer";
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role)
            };

            var identity = new ClaimsIdentity(claims, "FakeAuthScheme");
            context.User = new ClaimsPrincipal(identity);

            await _next(context);
        }
    }
}