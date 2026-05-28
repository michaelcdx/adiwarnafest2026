using AdiwarnaBackend.Data;
using AdiwarnaBackend.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Tournaments
{
    [Route("api/tournaments/{tournamentId:guid}/teams")]
    [ApiController]
    [Tags("Tournaments")]
    public class ListTournamentTeamsController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List tournament teams")]
        [EndpointDescription("Get all teams registered in a specific tournament with their details including gameType.")]
        public async Task<IActionResult> GetTournamentTeams(Guid tournamentId)
        {
            var tournament = await context.Tournaments
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tournamentId);

            if (tournament is null)
                return NotFound("Tournament not found.");

            // Teams persist the SmartEnum Value (e.g. "Mobile Legends") while
            // tournaments persist the raw name (e.g. "MobileLegends"), so match
            // against both spellings of the resolved game type.
            var matched = GameType.List.FirstOrDefault(gt =>
                string.Equals(gt.Name, tournament.GameType, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(gt.Value, tournament.GameType, StringComparison.OrdinalIgnoreCase));

            var gameTypeAliases = matched is null
                ? new[] { tournament.GameType }
                : new[] { matched.Name, matched.Value };

            var teams = await context.TournamentTeams
                .AsNoTracking()
                .Where(tt => tt.TournamentId == tournamentId && gameTypeAliases.Contains(tt.Team.GameType))
                .Include(tt => tt.Team)
                .Select(tt => new
                {
                    Id = tt.Team.Id,
                    Name = tt.Team.Name,
                    GameType = tt.Team.GameType
                })
                .ToListAsync();

            return Ok(teams);
        }
    }
}