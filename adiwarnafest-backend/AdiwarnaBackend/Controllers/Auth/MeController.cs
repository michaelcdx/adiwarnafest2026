using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using System.Security.Claims;

namespace AdiwarnaBackend.Controllers.Auth
{
    [Route("api/auth")]
    [Tags("Auth")]
    [Authorize]
    public class MeController : AuthControllerBase
    {
        [HttpGet("me")]
        [EndpointSummary("Current user")]
        [EndpointDescription("Return the authenticated user's profile and role.")]
        public IActionResult Me()
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized();

            return Ok(new
            {
                UserId = userId.Value,
                Username = User.FindFirstValue(ClaimTypes.Name),
                Role = User.FindFirstValue(ClaimTypes.Role)
            });
        }
    }
}
