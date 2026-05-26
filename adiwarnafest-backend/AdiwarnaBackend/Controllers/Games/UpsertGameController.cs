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
    public class UpsertGameController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPut("{gameId:guid}/upsert")]
        [EndpointSummary("Update game with player stats")]
        [EndpointDescription("Update an existing game's player stats. Game must be unlocked. Player TeamId must match Team1Id or Team2Id in the game. Requires Admin or Maintainer.")]
        public async Task<IActionResult> UpsertGame(Guid tournamentId, Guid gameId, [FromBody] UpsertGameDto request, CancellationToken cancellationToken)
        {
            var tournament = await context.Tournaments
                .AsNoTracking()
                .Include(t => t.TournamentTeams)
                .FirstOrDefaultAsync(t => t.Id == tournamentId, cancellationToken);

            if (tournament is null)
                return NotFound("Tournament not found.");

            var game = await context.Games
                .FirstOrDefaultAsync(g => g.Id == gameId && g.TournamentId == tournamentId, cancellationToken);

            if (game is null)
                return NotFound("Game not found.");

            if (game.IsLocked)
                return StatusCode(403, "Game is locked and cannot be modified.");

            var gameStatus = ParseGameStatus(request.GameStatus);

            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                game.GameStatus = gameStatus;
                game.ScheduledAt = request.ScheduledAt;
                game.Remark = request.Remark;

                var existingStats = await context.PlayerGameStats
                    .Where(pgs => pgs.GameId == gameId)
                    .ToListAsync(cancellationToken);
                context.PlayerGameStats.RemoveRange(existingStats);
                await context.SaveChangesAsync(cancellationToken);

                var allPlayerIds = request.TeamStats
                    .SelectMany(ts => ts.Players)
                    .Select(p => p.PlayerId)
                    .Distinct()
                    .ToList();

                var players = await context.Players
                    .Where(p => allPlayerIds.Contains(p.Id))
                    .ToListAsync(cancellationToken);

                var playerTeamIds = players.ToDictionary(p => p.Id, p => p.TeamId);
                var validTeamIds = new HashSet<Guid> { game.Team1Id, game.Team2Id };

                foreach (var playerId in allPlayerIds)
                {
                    if (!playerTeamIds.TryGetValue(playerId, out var playerTeamId) || !validTeamIds.Contains(playerTeamId))
                        return BadRequest($"Player with ID {playerId} does not belong to either team in this game.");
                }

                foreach (var teamInput in request.TeamStats)
                {
                    foreach (var playerInput in teamInput.Players)
                    {
                        var stat = new Entities.PlayerGameStat
                        {
                            GameId = game.Id,
                            PlayerId = playerInput.PlayerId,
                            Goals = playerInput.Goals,
                            Foul1 = playerInput.Foul1,
                            Foul2 = playerInput.Foul2
                        };
                        context.PlayerGameStats.Add(stat);
                    }
                }

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                var result = await context.Games
                    .AsNoTracking()
                    .Include(g => g.PlayerGameStats)
                    .ThenInclude(pgs => pgs.Player)
                    .ThenInclude(p => p!.Team)
                    .Include(g => g.Team1)
                    .Include(g => g.Team2)
                    .FirstOrDefaultAsync(g => g.Id == game.Id, cancellationToken);

                return Ok(MapToDto(result!));
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
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

        private static GameDto MapToDto(Entities.Game game)
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