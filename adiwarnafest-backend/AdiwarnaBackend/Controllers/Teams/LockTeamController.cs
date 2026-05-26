using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Teams
{
    [Route("api/teams")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("Teams")]
    public class LockTeamController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPost("{id:guid}/lock")]
        [EndpointSummary("Toggle team lock status")]
        [EndpointDescription("Locks an unlocked team or unlocks a locked team. Requires Admin or Maintainer.")]
        public async Task<IActionResult> ToggleLock(Guid id)
        {
            var team = await context.Teams.FirstOrDefaultAsync(t => t.Id == id);
            if (team is null)
                return NotFound();

            team.IsLocked = !team.IsLocked;
            await context.SaveChangesAsync();

            return Ok(new { team.Id, team.Name, team.IsLocked });
        }
    }
}