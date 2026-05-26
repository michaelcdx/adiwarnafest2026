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
    public class DeleteGameController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpDelete("{gameId:guid}")]
        [EndpointSummary("Delete game")]
        [EndpointDescription("Soft delete a game and cascade delete all player game stats. Requires Admin or Maintainer.")]
        public async Task<IActionResult> DeleteGame(Guid tournamentId, Guid gameId, CancellationToken cancellationToken)
        {
            var game = await context.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.TournamentId == tournamentId, cancellationToken);

            if (game is null)
                return NotFound("Game not found.");

            game.IsDeleted = true;
            game.DeletedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
    }
}