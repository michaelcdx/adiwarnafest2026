using AdiwarnaBackend.Data;
using AdiwarnaBackend.Enums;
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
    public class UpdateTournamentController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPatch("{id:guid}")]
        [EndpointSummary("Update tournament")]
        [EndpointDescription("Update a tournament. Name, TourneyStatus, Remark, and team participation can be edited. Use DELETE endpoint to delete. Use the lock endpoint to lock/unlock a tournament. Requires Admin or Maintainer.")]
        public async Task<IActionResult> UpdateTournament(Guid id, [FromBody] UpdateTournamentDto request, CancellationToken cancellationToken)
        {
            var tournament = await context.Tournaments
                .Include(t => t.TournamentTeams)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

            if (tournament is null)
                return NotFound();

            if (tournament.IsLocked)
            {
                if (!string.IsNullOrWhiteSpace(request.Name) ||
                    !string.IsNullOrWhiteSpace(request.TourneyStatus) ||
                    !string.IsNullOrWhiteSpace(request.GameType) ||
                    (request.TeamIds != null && request.TeamIds.Any()))
                {
                    return StatusCode(403, "Tournament is locked and cannot be modified.");
                }
            }

            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                if (!string.IsNullOrWhiteSpace(request.Name))
                    tournament.Name = request.Name.Trim().ToUpperInvariant();

                if (!string.IsNullOrWhiteSpace(request.TourneyStatus))
                {
                    string tourneyStatus;
                    try { tourneyStatus = ParseTourneyStatus(request.TourneyStatus); }
                    catch (ArgumentException ex) { return BadRequest(ex.Message); }
                    tournament.TourneyStatus = tourneyStatus;
                }

                if (!string.IsNullOrWhiteSpace(request.GameType))
                {
                    if (tournament.TournamentTeams.Any())
                        return BadRequest("Cannot change GameType when tournament has teams.");

                    var validGameTypes = new[] { "Basketball5v5", "Futsal", "Mobile Legends" };
                    if (!validGameTypes.Contains(request.GameType))
                        return BadRequest("Invalid GameType.");

                    tournament.GameType = request.GameType;
                }

                if (request.Remark != null)
                    tournament.Remark = request.Remark;

                if (request.TeamIds != null)
                {
                    var existingTeamIds = tournament.TournamentTeams.Select(tt => tt.TeamId).ToHashSet();
                    var processedTeamIds = new HashSet<Guid>();

                    foreach (var teamId in request.TeamIds)
                    {
                        if (!existingTeamIds.Contains(teamId))
                        {
                            var team = await context.Teams.FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);
                            if (team is null)
                            {
                                await transaction.RollbackAsync();
                                return BadRequest($"Team with ID {teamId} not found.");
                            }
                        }

                        processedTeamIds.Add(teamId);
                    }

                    var teamsToRemove = tournament.TournamentTeams.Where(tt => !processedTeamIds.Contains(tt.TeamId)).ToList();
                    foreach (var tt in teamsToRemove)
                    {
                        context.TournamentTeams.Remove(tt);
                    }

                    var teamsToAdd = request.TeamIds.Where(tid => !existingTeamIds.Contains(tid)).ToList();
                    foreach (var teamId in teamsToAdd)
                    {
                        var tournamentTeam = new Entities.TournamentTeam
                        {
                            TournamentId = tournament.Id,
                            TeamId = teamId,
                            Placement = null
                        };
                        context.TournamentTeams.Add(tournamentTeam);
                    }
                }

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                var updatedTournament = await context.Tournaments
                    .Include(t => t.TournamentTeams)
                    .ThenInclude(tt => tt.Team)
                    .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

                return Ok(MapToDto(updatedTournament!));
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        private static string ParseTourneyStatus(string status)
        {
            var trimmed = status.Trim();
            if (string.Equals(trimmed, TournamentStatus.UPCOMING.Name, StringComparison.OrdinalIgnoreCase))
                return TournamentStatus.UPCOMING.Name;
            if (string.Equals(trimmed, TournamentStatus.ONGOING.Name, StringComparison.OrdinalIgnoreCase))
                return TournamentStatus.ONGOING.Name;
            if (string.Equals(trimmed, TournamentStatus.COMPLETED.Name, StringComparison.OrdinalIgnoreCase))
                return TournamentStatus.COMPLETED.Name;

            throw new ArgumentException("Invalid TourneyStatus.");
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