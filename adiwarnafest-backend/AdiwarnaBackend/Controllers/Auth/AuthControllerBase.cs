using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AdiwarnaBackend.Controllers.Auth
{
    [ApiController]
    public abstract class AuthControllerBase : ControllerBase
    {
        protected Guid? GetUserId()
        {
            var idValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(idValue, out var userId) ? userId : null;
        }

        protected string? GetIpAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        protected string? GetUserAgent()
        {
            var userAgent = Request.Headers.UserAgent.ToString();
            return string.IsNullOrWhiteSpace(userAgent) ? null : userAgent;
        }
    }
}
