using AdiwarnaBackend.Data;
using AdiwarnaBackend.Models.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Games
{
    public class SetGameScoreDto
    {
        public int Team1Score { get; set; }
        public int Team2Score { get; set; }
        public string GameStatus { get; set; } = "COMPLETED";
    }

    [Route("api/tournaments/{tournamentId:guid}/games")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("Games")]
    public class SetGameScoreController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPatch("{gameId:guid}/score")]
        [EndpointSummary("Set game score")]
        [EndpointDescription("Directly set the score for a game. Game must be unlocked. Requires Admin or Maintainer.")]
        public async Task<IActionResult> SetScore(Guid tournamentId, Guid gameId, [FromBody] SetGameScoreDto request, CancellationToken cancellationToken)
        {
            var game = await context.Games
                .Include(g => g.Team1)
                .Include(g => g.Team2)
                .Include(g => g.PlayerGameStats)
                .ThenInclude(pgs => pgs.Player)
                .ThenInclude(p => p!.Team)
                .FirstOrDefaultAsync(g => g.Id == gameId && g.TournamentId == tournamentId, cancellationToken);

            if (game is null)
                return NotFound("Game not found.");

            if (game.IsLocked)
                return StatusCode(403, "Game is locked and cannot be modified.");

            game.Team1Score = request.Team1Score;
            game.Team2Score = request.Team2Score;

            if (!string.IsNullOrWhiteSpace(request.GameStatus))
            {
                var trimmed = request.GameStatus.Trim();
                if (trimmed != "UPCOMING" && trimmed != "ONGOING" && trimmed != "COMPLETED")
                    return BadRequest("Invalid GameStatus. Must be UPCOMING, ONGOING, or COMPLETED.");
                game.GameStatus = trimmed;
            }

            await context.SaveChangesAsync(cancellationToken);

            return Ok(new GameDto
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
                PlayerStats = game.PlayerGameStats.Select(pgs => new PlayerGameStatDto
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
