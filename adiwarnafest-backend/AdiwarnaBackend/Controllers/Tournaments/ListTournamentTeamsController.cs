using AdiwarnaBackend.Data;
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

            var teams = await context.TournamentTeams
                .AsNoTracking()
                .Where(tt => tt.TournamentId == tournamentId && tt.Team.GameType == tournament.GameType)
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