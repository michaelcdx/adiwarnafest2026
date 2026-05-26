using AdiwarnaBackend.Models.Auth;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.RateLimiting;

namespace AdiwarnaBackend.Controllers.Auth
{
    [Route("api/auth")]
    [Tags("Auth")]
    public class RegisterController(IAuthService authService) : AuthControllerBase
    {
        [DisableRateLimiting]
        [HttpPost("register")]
        [EndpointSummary("Register")]
        [EndpointDescription("Create a new participant account using email and password. Self-registration only assigns Player role.")]
        public async Task<ActionResult> Register(RegisterRequestDto request)
        {
            var (success, errorMessage) = await authService.RegisterAsync(request);
            if (!success)
            {
                return BadRequest(errorMessage ?? "Failed to register account.");
            }

            return Ok();
        }
    }
}
