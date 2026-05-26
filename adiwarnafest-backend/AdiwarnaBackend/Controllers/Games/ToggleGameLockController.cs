using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Games
{
    [Route("api/tournaments/{tournamentId:guid}/games")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("Games")]
    public class ToggleGameLockController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPost("{gameId:guid}/lock")]
        [EndpointSummary("Toggle game lock")]
        [EndpointDescription("Lock or unlock a game. When locked, game cannot be modified via upsert. Requires Admin or Maintainer.")]
        public async Task<IActionResult> ToggleLock(Guid tournamentId, Guid gameId, CancellationToken cancellationToken)
        {
            var game = await context.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.TournamentId == tournamentId, cancellationToken);

            if (game is null)
                return NotFound("Game not found.");

            game.IsLocked = !game.IsLocked;
            await context.SaveChangesAsync(cancellationToken);

            return Ok(new { gameId = game.Id, isLocked = game.IsLocked });
        }
    }
}