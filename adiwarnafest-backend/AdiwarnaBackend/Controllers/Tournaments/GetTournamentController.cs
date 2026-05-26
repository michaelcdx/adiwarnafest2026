using AdiwarnaBackend.Data;
using AdiwarnaBackend.Models.Tournaments;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Tournaments
{
    [Route("api/tournaments")]
    [ApiController]
    [Tags("Tournaments")]
    public class GetTournamentController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        [EndpointSummary("Get tournament")]
        [EndpointDescription("Public read of a tournament by id. Includes participating teams.")]
        public async Task<IActionResult> GetTournament(Guid id)
        {
            var tournament = await context.Tournaments
                .AsNoTracking()
                .Include(t => t.TournamentTeams)
                .ThenInclude(tt => tt.Team)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tournament is null)
                return NotFound();

            return Ok(MapToDto(tournament));
        }

        private static TournamentDto MapToDto(Entities.Tournament tournament)
        {
            return new TournamentDto
            {
                Id = tournament.Id,
                Name = tournament.Name,
                TourneyStatus = tournament.TourneyStatus,
                GameType = tournament.GameType,
                Remark = tournament.Remark,
                IsDeleted = tournament.IsDeleted,
                DeletedAt = tournament.DeletedAt,
                IsLocked = tournament.IsLocked,
                Teams = tournament.TournamentTeams.Select(tt => new TournamentTeamDto
                {
                    TeamId = tt.TeamId,
                    TeamName = tt.Team?.Name ?? string.Empty,
                    Placement = tt.Placement
                }).ToList()
            };
        }
    }
}