using AdiwarnaBackend.Models.Auth;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;

namespace AdiwarnaBackend.Controllers.Auth
{
    [Route("api/auth")]
    [Tags("Auth")]
    public class LogoutController(IAuthService authService) : AuthControllerBase
    {
        [HttpPost("logout")]
        [EndpointSummary("Logout")]
        [EndpointDescription("Revoke the provided refresh token for the user.")]
        public async Task<IActionResult> Logout(LogoutRequestDto request)
        {
            var revoked = await authService.RevokeRefreshTokenAsync(request.UserId, request.RefreshToken);
            if (!revoked)
                return Unauthorized("Invalid refresh token.");

            return Ok(new { Message = "Logged out." });
        }
    }
}
