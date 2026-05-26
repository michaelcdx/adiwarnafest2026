using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Tournaments
{
    [Route("api/tournaments")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("Tournaments")]
    public class LockTournamentController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPost("{id:guid}/lock")]
        [EndpointSummary("Toggle tournament lock status")]
        [EndpointDescription("Locks an unlocked tournament or unlocks a locked tournament. Requires Admin or Maintainer.")]
        public async Task<IActionResult> ToggleLock(Guid id)
        {
            var tournament = await context.Tournaments.FirstOrDefaultAsync(t => t.Id == id);
            if (tournament is null)
                return NotFound();

            tournament.IsLocked = !tournament.IsLocked;
            await context.SaveChangesAsync();

            return Ok(new { tournament.Id, tournament.Name, tournament.IsLocked });
        }
    }
}