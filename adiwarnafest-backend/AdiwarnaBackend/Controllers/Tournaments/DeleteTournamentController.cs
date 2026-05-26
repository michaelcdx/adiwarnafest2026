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
    public class DeleteTournamentController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpDelete("{id:guid}")]
        [EndpointSummary("Delete tournament")]
        [EndpointDescription("Soft delete a tournament. Requires Admin or Maintainer. Locked tournaments cannot be deleted.")]
        public async Task<IActionResult> DeleteTournament(Guid id)
        {
            var tournament = await context.Tournaments.FirstOrDefaultAsync(t => t.Id == id);
            if (tournament is null)
                return NotFound();

            if (tournament.IsLocked)
                return StatusCode(403, "Tournament is locked and cannot be deleted.");

            tournament.IsDeleted = true;
            tournament.DeletedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}