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
    public class ListTournamentsController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List tournaments")]
        [EndpointDescription("Public list of tournaments.")]
        public async Task<IActionResult> GetTournaments([FromQuery] bool includeDeleted = false)
        {
            IQueryable<Entities.Tournament> query = context.Tournaments.AsNoTracking();

            if (includeDeleted)
            {
                query = query.IgnoreQueryFilters();
            }

            var tournaments = await query
                .Include(t => t.TournamentTeams)
                .ThenInclude(tt => tt.Team)
                .OrderBy(t => t.Name)
                .ThenBy(t => t.Id)
                .ToListAsync();

            var dtos = tournaments.Select(MapToDto).ToList();
            return Ok(dtos);
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