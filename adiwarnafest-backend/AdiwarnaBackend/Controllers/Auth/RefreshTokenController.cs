using AdiwarnaBackend.Models.Auth;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.RateLimiting;

namespace AdiwarnaBackend.Controllers.Auth
{
    [Route("api/auth")]
    [Tags("Auth")]
    public class RefreshTokenController(IAuthService authService) : AuthControllerBase
    {
        [EnableRateLimiting("auth")]
        [HttpPost("refresh-token")]
        [EndpointSummary("Refresh tokens")]
        [EndpointDescription("Rotate refresh token and issue a new access token.")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
        {
            var result = await authService.RefreshTokensAsync(request, GetIpAddress(), GetUserAgent());
            if (result is null || result.AccessToken is null || result.RefreshToken is null)
                return Unauthorized("Invalid refresh token.");

            return Ok(result);
        }
    }
}
