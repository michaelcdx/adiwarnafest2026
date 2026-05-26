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
    public class UpdateGameController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPatch("{gameId:guid}")]
        [EndpointSummary("Update game")]
        [EndpointDescription("Update game metadata (status, scheduled time, remark). Requires Admin or Maintainer.")]
        public async Task<IActionResult> UpdateGame(Guid tournamentId, Guid gameId, [FromBody] UpdateGameDto request, CancellationToken cancellationToken)
        {
            var game = await context.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.TournamentId == tournamentId, cancellationToken);

            if (game is null)
                return NotFound("Game not found.");

            if (game.IsLocked)
                return StatusCode(403, "Game is locked and cannot be modified.");

            if (!string.IsNullOrWhiteSpace(request.GameStatus))
            {
                var gameStatus = ParseGameStatus(request.GameStatus);
                game.GameStatus = gameStatus;
            }

            if (request.ScheduledAt.HasValue)
                game.ScheduledAt = request.ScheduledAt.Value;

            if (request.Remark != null)
                game.Remark = request.Remark;

            await context.SaveChangesAsync(cancellationToken);

            var tournament = await context.Tournaments
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tournamentId, cancellationToken);

            var updated = await context.Games
                .AsNoTracking()
                .Include(g => g.PlayerGameStats)
                .ThenInclude(pgs => pgs.Player)
                .ThenInclude(p => p!.Team)
                .Include(g => g.Team1)
                .Include(g => g.Team2)
                .FirstOrDefaultAsync(g => g.Id == game.Id, cancellationToken);

            return Ok(MapToDto(updated!, tournament?.GameType ?? string.Empty));
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
                Team1Name = game.Team1?.Name ?? string.Empty,
                Team2Name = game.Team2?.Name ?? string.Empty,
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