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
    public class GetGameController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet("{gameId:guid}")]
        [EndpointSummary("Get game")]
        [EndpointDescription("Get a single game with player stats. Requires Admin or Maintainer.")]
        public async Task<IActionResult> GetGame(Guid tournamentId, Guid gameId, CancellationToken cancellationToken)
        {
            var game = await context.Games
                .AsNoTracking()
                .Include(g => g.PlayerGameStats)
                .ThenInclude(pgs => pgs.Player)
                .ThenInclude(p => p!.Team)
                .FirstOrDefaultAsync(g => g.Id == gameId && g.TournamentId == tournamentId, cancellationToken);

            if (game is null)
                return NotFound("Game not found.");

            var tournament = await context.Tournaments
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tournamentId, cancellationToken);

            return Ok(MapToDto(game, tournament?.GameType ?? string.Empty));
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