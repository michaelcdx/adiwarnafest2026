using AdiwarnaBackend.Models.Auth;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;

namespace AdiwarnaBackend.Controllers.Auth
{
    [Route("api/auth")]
    [Tags("Auth")]
    public class DeleteAccountController(IAuthService authService) : AuthControllerBase
    {
        [HttpPost("delete-account")]
        [EndpointSummary("Delete Account")]
        [EndpointDescription("Permanently delete a user account with email and password verification.")]
        public async Task<ActionResult> DeleteAccount(DeleteAccountRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Email and password are required.");

            var result = await authService.DeleteAccountAsync(request);
            if (!result)
                return BadRequest("Invalid email or password.");

            return Ok(new { message = "Account deleted successfully." });
        }
    }
}
