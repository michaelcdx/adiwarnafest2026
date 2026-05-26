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
    public class GetUserController(IUserManagementService userManagementService) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        [EndpointSummary("Get user")]
        [EndpointDescription("Get a single user by id.")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await userManagementService.GetUserAsync(id);
            if (user is null)
                return NotFound();

            return Ok(user);
        }
    }
}
