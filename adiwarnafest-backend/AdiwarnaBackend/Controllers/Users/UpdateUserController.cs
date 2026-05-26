using AdiwarnaBackend.Models.Users;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;

namespace AdiwarnaBackend.Controllers.Users
{
    [Route("api/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    [Tags("Users")]
    public class UpdateUserController(IUserManagementService userManagementService) : ControllerBase
    {
        [HttpPatch("{id:guid}")]
        [EndpointSummary("Update user")]
        [EndpointDescription("Update username, role, or disabled status. Admin role cannot be assigned.")]
        public async Task<IActionResult> UpdateUser(Guid id, AdminUpdateUserDto request)
        {
            try
            {
                var user = await userManagementService.UpdateUserAsync(id, request);
                if (user is null)
                    return NotFound();

                return Ok(user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
