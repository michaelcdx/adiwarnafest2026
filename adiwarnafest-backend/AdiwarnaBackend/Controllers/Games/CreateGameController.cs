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

            if (request.Team1Id == Guid.Empty)
                return BadRequest("Team1 is required.");
            if (request.Team2Id == Guid.Empty)
                return BadRequest("Team2 is required.");
            if (request.Team1Id == request.Team2Id)
                return BadRequest("A game cannot have the same team for both sides.");

            var tournamentTeamIds = tournament.TournamentTeams.Select(tt => tt.TeamId).ToHashSet();
            if (!tournamentTeamIds.Contains(request.Team1Id))
                return BadRequest($"Team with ID {request.Team1Id} is not part of this tournament.");
            if (!tournamentTeamIds.Contains(request.Team2Id))
                return BadRequest($"Team with ID {request.Team2Id} is not part of this tournament.");

            var team1 = tournament.TournamentTeams.First(tt => tt.TeamId == request.Team1Id).Team;
            var team2 = tournament.TournamentTeams.First(tt => tt.TeamId == request.Team2Id).Team;
            if (team1.GameType != tournament.GameType)
                return BadRequest($"Team '{team1.Name}' GameType does not match tournament.");
            if (team2.GameType != tournament.GameType)
                return BadRequest($"Team '{team2.Name}' GameType does not match tournament.");

            var gameStatus = ParseGameStatus(request.GameStatus);

            var game = new Entities.Game
            {
                TournamentId = tournamentId,
                Team1Id = request.Team1Id,
                Team2Id = request.Team2Id,
                GameStatus = gameStatus,
                ScheduledAt = request.ScheduledAt,
                Remark = request.Remark
            };

            context.Games.Add(game);
            await context.SaveChangesAsync(cancellationToken);

            var created = await context.Games
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.Id == game.Id, cancellationToken);

            return Ok(MapToDto(created!, tournament.GameType));
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

        private static GameDto MapToDto(Entities.Game game, string tournamentGameType)
        {
            var stats = game.PlayerGameStats;
            var team1Stats = stats.Where(s => s.Player?.TeamId == game.Team1Id).ToList();
            var team2Stats = stats.Where(s => s.Player?.TeamId == game.Team2Id).ToList();

            return new GameDto
            {
                Id = game.Id,
                TournamentId = game.TournamentId,
                Team1Id = game.Team1Id,
                Team2Id = game.Team2Id,
                Team1Name = team1Stats.FirstOrDefault()?.Player?.Team?.Name ?? string.Empty,
                Team2Name = team2Stats.FirstOrDefault()?.Player?.Team?.Name ?? string.Empty,
                GameStatus = game.GameStatus,
                ScheduledAt = game.ScheduledAt,
                Remark = game.Remark,
                IsDeleted = game.IsDeleted,
                DeletedAt = game.DeletedAt,
                IsLocked = game.IsLocked,
                PlayerStats = stats.Select(pgs => new PlayerGameStatDto
                {
                    PlayerId = pgs.PlayerId,
                    PlayerName = pgs.Player?.Name ?? string.Empty,
                    PlayerNumber = pgs.Player?.PlayerNumber ?? 0,
                    TeamId = pgs.Player?.TeamId ?? Guid.Empty,
                    TeamName = pgs.Player?.Team?.Name ?? string.Empty,
                    Goals = pgs.Goals,
                    Foul1 = pgs.Foul1,
                    Foul2 = pgs.Foul2
                }).ToList()
            };
        }
    }
}