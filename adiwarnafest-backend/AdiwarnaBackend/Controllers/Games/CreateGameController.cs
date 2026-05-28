using AdiwarnaBackend.Data;
using AdiwarnaBackend.Enums;
using AdiwarnaBackend.Models.Games;
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
    public class CreateGameController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPost]
        [EndpointSummary("Create game")]
        [EndpointDescription("Create a new game for a locked tournament with two different teams. Requires Admin or Maintainer.")]
        public async Task<IActionResult> CreateGame(Guid tournamentId, [FromBody] CreateGameDto request, CancellationToken cancellationToken)
        {
            var tournament = await context.Tournaments
                .AsNoTracking()
                .Include(t => t.TournamentTeams)
                .ThenInclude(tt => tt.Team)
                .FirstOrDefaultAsync(t => t.Id == tournamentId, cancellationToken);

            if (tournament is null)
                return NotFound("Tournament not found.");

            if (!tournament.IsLocked)
                return StatusCode(403, "Tournament must be locked to create games.");

            // A null/empty team id means TBC (To Be Confirmed) — allowed.
            var team1Id = request.Team1Id == Guid.Empty ? null : request.Team1Id;
            var team2Id = request.Team2Id == Guid.Empty ? null : request.Team2Id;

            if (team1Id.HasValue && team2Id.HasValue && team1Id == team2Id)
                return BadRequest("A game cannot have the same team for both sides.");

            var tournamentTeamIds = tournament.TournamentTeams.Select(tt => tt.TeamId).ToHashSet();

            Entities.Team? team1 = null;
            if (team1Id.HasValue)
            {
                if (!tournamentTeamIds.Contains(team1Id.Value))
                    return BadRequest($"Team with ID {team1Id} is not part of this tournament.");
                team1 = tournament.TournamentTeams.First(tt => tt.TeamId == team1Id).Team;
                if (!GameType.ValuesMatch(team1.GameType, tournament.GameType))
                    return BadRequest($"Team '{team1.Name}' GameType does not match tournament.");
            }

            Entities.Team? team2 = null;
            if (team2Id.HasValue)
            {
                if (!tournamentTeamIds.Contains(team2Id.Value))
                    return BadRequest($"Team with ID {team2Id} is not part of this tournament.");
                team2 = tournament.TournamentTeams.First(tt => tt.TeamId == team2Id).Team;
                if (!GameType.ValuesMatch(team2.GameType, tournament.GameType))
                    return BadRequest($"Team '{team2.Name}' GameType does not match tournament.");
            }

            string gameStatus;
            try { gameStatus = ParseGameStatus(request.GameStatus); }
            catch (ArgumentException) { return BadRequest("Invalid GameStatus."); }

            var game = new Entities.Game
            {
                TournamentId = tournamentId,
                Team1Id = team1Id,
                Team2Id = team2Id,
                GameStatus = gameStatus,
                ScheduledAt = request.ScheduledAt,
                Remark = request.Remark
            };

            context.Games.Add(game);
            await context.SaveChangesAsync(cancellationToken);

            return Ok(new GameDto
            {
                Id = game.Id,
                TournamentId = game.TournamentId,
                Team1Id = game.Team1Id,
                Team2Id = game.Team2Id,
                Team1Name = team1?.Name ?? "TBC",
                Team2Name = team2?.Name ?? "TBC",
                GameStatus = game.GameStatus,
                ScheduledAt = game.ScheduledAt,
                Remark = game.Remark,
                IsDeleted = game.IsDeleted,
                DeletedAt = game.DeletedAt,
                IsLocked = game.IsLocked,
                Team1Score = game.Team1Score,
                Team2Score = game.Team2Score,
                PlayerStats = new()
            });
        }

        private static string ParseGameStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return TournamentStatus.UPCOMING.Name;

            var trimmed = status.Trim();
            if (string.Equals(trimmed, TournamentStatus.UPCOMING.Name, StringComparison.OrdinalIgnoreCase))
                return TournamentStatus.UPCOMING.Name;
            if (string.Equals(trimmed, TournamentStatus.ONGOING.Name, StringComparison.OrdinalIgnoreCase))
                return TournamentStatus.ONGOING.Name;
            if (string.Equals(trimmed, TournamentStatus.COMPLETED.Name, StringComparison.OrdinalIgnoreCase))
                return TournamentStatus.COMPLETED.Name;

            throw new ArgumentException("Invalid GameStatus.");
        }
    }
}