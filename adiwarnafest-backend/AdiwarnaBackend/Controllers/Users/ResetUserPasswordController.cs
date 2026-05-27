using AdiwarnaBackend.Models.Users;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;

namespace AdiwarnaBackend.Controllers.Users
{
    [Route("api/users")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("Users")]
    public class ResetUserPasswordController(IUserManagementService userManagementService) : ControllerBase
    {
        [HttpPost("{id:guid}/reset-password")]
        [EndpointSummary("Reset user password")]
        [EndpointDescription("Admin only. Sets a new password for the specified user. Admin accounts cannot be reset via this API.")]
        public async Task<IActionResult> ResetPassword(Guid id, AdminResetPasswordDto request)
        {
            try
            {
                var success = await userManagementService.ResetPasswordAsync(id, request);
                if (!success)
                    return NotFound();

                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
