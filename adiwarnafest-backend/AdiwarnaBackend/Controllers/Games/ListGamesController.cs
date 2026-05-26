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
    public class ListGamesController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List games")]
        [EndpointDescription("List all games for a tournament. Requires Admin or Maintainer.")]
        public async Task<IActionResult> GetGames(Guid tournamentId, CancellationToken cancellationToken)
        {
            var tournament = await context.Tournaments
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tournamentId, cancellationToken);

            if (tournament is null)
                return NotFound("Tournament not found.");

            var games = await context.Games
                .AsNoTracking()
                .Include(g => g.PlayerGameStats)
                .ThenInclude(pgs => pgs.Player)
                .ThenInclude(p => p!.Team)
                .Include(g => g.Team1)
                .Include(g => g.Team2)
                .Where(g => g.TournamentId == tournamentId)
                .OrderBy(g => g.GameStatus == TournamentStatus.UPCOMING ? 0 : g.GameStatus == TournamentStatus.ONGOING ? 1 : 2)
                .ThenBy(g => g.ScheduledAt)
                .ToListAsync(cancellationToken);

            var dtos = games.Select(g => MapToDto(g, tournament.GameType)).ToList();
            return Ok(dtos);
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
                Team1Score = game.Team1Score,
                Team2Score = game.Team2Score,
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