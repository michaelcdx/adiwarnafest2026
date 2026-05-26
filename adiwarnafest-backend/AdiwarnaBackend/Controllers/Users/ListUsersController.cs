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
    public class ListUsersController(IUserManagementService userManagementService) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List users")]
        [EndpointDescription("List all users. Use includeDisabled to include disabled accounts.")]
        public async Task<IActionResult> GetUsers([FromQuery] bool includeDisabled = true)
        {
            var users = await userManagementService.GetUsersAsync(includeDisabled);
            return Ok(users);
        }
    }
}
