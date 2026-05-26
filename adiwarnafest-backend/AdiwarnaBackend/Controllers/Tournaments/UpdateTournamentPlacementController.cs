using AdiwarnaBackend.Data;
using AdiwarnaBackend.Models.Tournaments;
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
    public class UpdateTournamentPlacementController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPatch("{id:guid}/placements")]
        [EndpointSummary("Update tournament placement")]
        [EndpointDescription("Update the placement of a team within a tournament. This is allowed even when the tournament is locked. Requires Admin or Maintainer.")]
        public async Task<IActionResult> UpdatePlacement(Guid id, [FromBody] UpdateTournamentPlacementDto request, CancellationToken cancellationToken)
        {
            var tournament = await context.Tournaments
                .Include(t => t.TournamentTeams)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            if (tournament is null)
                return NotFound();

            var tournamentTeam = tournament.TournamentTeams.FirstOrDefault(tt => tt.TeamId == request.TeamId);
            if (tournamentTeam is null)
                return NotFound($"Team with ID {request.TeamId} is not part of this tournament.");

            tournamentTeam.Placement = request.Placement;
            await context.SaveChangesAsync(cancellationToken);

            var updatedTournament = await context.Tournaments
                .Include(t => t.TournamentTeams)
                .ThenInclude(tt => tt.Team)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            return Ok(MapToDto(updatedTournament!));
        }

        private static TournamentDto MapToDto(Entities.Tournament tournament)
        {
            return new TournamentDto
            {
                Id = tournament.Id,
                Name = tournament.Name,
                TourneyStatus = tournament.TourneyStatus,
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