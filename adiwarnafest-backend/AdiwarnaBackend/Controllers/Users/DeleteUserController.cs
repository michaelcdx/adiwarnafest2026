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
    public class DeleteUserController(IUserManagementService userManagementService) : ControllerBase
    {
        [HttpDelete("{id:guid}")]
        [EndpointSummary("Delete user")]
        [EndpointDescription("Permanently delete a user. Admin users cannot be deleted.")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var result = await userManagementService.DeleteUserAsync(id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
