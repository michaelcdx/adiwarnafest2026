using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;

namespace AdiwarnaBackend.Controllers.Auth
{
    [Route("api/auth")]
    [Tags("Auth")]
    [Authorize]
    public class LogoutAllController(IAuthService authService) : AuthControllerBase
    {
        [HttpPost("logout-all")]
        [EndpointSummary("Logout all sessions")]
        [EndpointDescription("Revoke all active refresh tokens for the authenticated user.")]
        public async Task<IActionResult> LogoutAll()
        {
            var userId = GetUserId();
            if (userId is null)
                return Unauthorized();

            var revokedCount = await authService.RevokeAllRefreshTokensAsync(userId.Value);
            return Ok(new { RevokedTokens = revokedCount });
        }
    }
}
