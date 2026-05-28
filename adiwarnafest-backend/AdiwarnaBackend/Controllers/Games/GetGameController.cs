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
                .Include(g => g.Team1)
                .Include(g => g.Team2)
                .Include(g => g.PlayerGameStats)
                .ThenInclude(pgs => pgs.Player)
                .ThenInclude(p => p!.Team)
                .FirstOrDefaultAsync(g => g.Id == gameId && g.TournamentId == tournamentId, cancellationToken);

            if (game is null)
                return NotFound("Game not found.");

            var stats = game.PlayerGameStats;
            return Ok(new GameDto
            {
                Id = game.Id,
                TournamentId = game.TournamentId,
                Team1Id = game.Team1Id,
                Team2Id = game.Team2Id,
                Team1Name = game.Team1?.Name ?? "TBC",
                Team2Name = game.Team2?.Name ?? "TBC",
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
            });
        }
    }
}