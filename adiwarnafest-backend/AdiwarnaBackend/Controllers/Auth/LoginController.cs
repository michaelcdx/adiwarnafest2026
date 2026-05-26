using AdiwarnaBackend.Models.Auth;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.RateLimiting;

namespace AdiwarnaBackend.Controllers.Auth
{
    [Route("api/auth")]
    [Tags("Auth")]
    public class LoginController(IAuthService authService) : AuthControllerBase
    {
        [DisableRateLimiting]
        [HttpPost("login")]
        [EndpointSummary("Login")]
        [EndpointDescription("Authenticate with email and password and receive access and refresh tokens.")]
        public async Task<ActionResult<TokenResponseDto>> Login(LoginRequestDto request)
        {
            var result = await authService.LoginAsync(request, GetIpAddress(), GetUserAgent());
            if (result is null)
                return BadRequest("Invalid email or password.");

            return Ok(result);
        }
    }
}
