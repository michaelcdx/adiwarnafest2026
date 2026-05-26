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
    public class CreateUserController(IUserManagementService userManagementService) : ControllerBase
    {
        [HttpPost]
        [EndpointSummary("Create user")]
        [EndpointDescription("Create a new user with the Maintainer role.")]
        public async Task<IActionResult> CreateUser(AdminCreateUserDto request)
        {
            try
            {
                var user = await userManagementService.CreateUserAsync(request);
                if (user is null)
                    return BadRequest("Email already exists.");

                return Ok(user);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
