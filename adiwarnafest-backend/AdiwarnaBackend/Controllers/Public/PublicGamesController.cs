using AdiwarnaBackend.Data;
using AdiwarnaBackend.Models.Games;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Public
{
    [Route("api/public/tournaments/{tournamentId:guid}/games")]
    [ApiController]
    [Tags("Public")]
    public class PublicGamesController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List games (public)")]
        [EndpointDescription("Public list of games for a tournament. No authentication required.")]
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
                .Where(g => g.TournamentId == tournamentId && !g.IsDeleted)
                .OrderBy(g => g.ScheduledAt)
                .ToListAsync(cancellationToken);

            var dtos = games.Select(g => new GameDto
            {
                Id = g.Id,
                TournamentId = g.TournamentId,
                Team1Id = g.Team1Id,
                Team2Id = g.Team2Id,
                Team1Name = g.Team1?.Name ?? string.Empty,
                Team2Name = g.Team2?.Name ?? string.Empty,
                GameStatus = g.GameStatus,
                ScheduledAt = g.ScheduledAt,
                Remark = g.Remark,
                IsDeleted = g.IsDeleted,
                DeletedAt = g.DeletedAt,
                IsLocked = g.IsLocked,
                Team1Score = g.Team1Score,
                Team2Score = g.Team2Score,
                PlayerStats = g.PlayerGameStats.Select(pgs => new PlayerGameStatDto
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
            }).ToList();

            return Ok(dtos);
        }
    }
}
