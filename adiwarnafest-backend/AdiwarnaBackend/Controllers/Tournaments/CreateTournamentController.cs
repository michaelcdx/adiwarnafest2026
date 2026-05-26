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
    public class CreateTournamentController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPost]
        [EndpointSummary("Create tournament")]
        [EndpointDescription("Create a new tournament with optional participating teams. Requires Admin or Maintainer.")]
        public async Task<IActionResult> CreateTournament(CreateTournamentDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Tournament name is required.");

            string tourneyStatus;
            try { tourneyStatus = ParseTourneyStatus(request.TourneyStatus); }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }

            await using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var tournament = new Entities.Tournament
                {
                    Name = request.Name.Trim().ToUpperInvariant(),
                    GameType = request.GameType,
                    TourneyStatus = tourneyStatus,
                    Remark = request.Remark,
                    IsLocked = request.IsLocked
                };

                context.Tournaments.Add(tournament);
                await context.SaveChangesAsync();

                if (request.TeamIds != null && request.TeamIds.Any())
                {
                    foreach (var teamId in request.TeamIds)
                    {
                        var team = await context.Teams.FirstOrDefaultAsync(t => t.Id == teamId);
                        if (team is null)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest($"Team with ID {teamId} not found.");
                        }

                        var tournamentTeam = new Entities.TournamentTeam
                        {
                            TournamentId = tournament.Id,
                            TeamId = teamId,
                            Placement = null
                        };

                        context.TournamentTeams.Add(tournamentTeam);
                    }

                    await context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                var createdTournament = await context.Tournaments
                    .Include(t => t.TournamentTeams)
                    .ThenInclude(tt => tt.Team)
                    .FirstOrDefaultAsync(t => t.Id == tournament.Id);

                return Ok(MapToDto(createdTournament!));
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static string ParseTourneyStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("TourneyStatus is required.");

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