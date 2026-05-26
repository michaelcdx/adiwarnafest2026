using AdiwarnaBackend.Data;
using AdiwarnaBackend.Enums;
using AdiwarnaBackend.Models.Teams;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Teams
{
    [Route("api/teams")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("Teams")]
    public class CreateTeamController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPost]
        [EndpointSummary("Create team")]
        [EndpointDescription("Create a new team with optional players. Requires Admin or Maintainer.")]
        public async Task<IActionResult> CreateTeam(CreateTeamDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Team name is required.");

            var gameType = ParseGameType(request.GameType);

            await using var transaction = await context.Database.BeginTransactionAsync();

            try
            {
                var team = new Entities.Team
                {
                    Name = request.Name.Trim().ToUpperInvariant(),
                    GameType = gameType,
                    IsLocked = request.IsLocked
                };

                context.Teams.Add(team);
                await context.SaveChangesAsync();

                if (request.Players != null && request.Players.Any())
                {
                    var playerNumbers = new HashSet<int>();
                    foreach (var playerDto in request.Players)
                    {
                        if (string.IsNullOrWhiteSpace(playerDto.Name))
                            return BadRequest("Player name is required.");

                        if (playerDto.PlayerNumber < 0 || playerDto.PlayerNumber > 99)
                            return BadRequest($"Player number must be between 0 and 99.");

                        if (!playerNumbers.Add(playerDto.PlayerNumber))
                            return BadRequest($"Duplicate player number {playerDto.PlayerNumber} in team.");

                        var player = new Entities.Player
                        {
                            TeamId = team.Id,
                            Name = playerDto.Name.Trim().ToUpperInvariant(),
                            PlayerNumber = playerDto.PlayerNumber
                        };

                        context.Players.Add(player);
                    }

                    await context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                var createdTeam = await context.Teams
                    .Include(t => t.Players)
                    .FirstOrDefaultAsync(t => t.Id == team.Id);

                return Ok(createdTeam);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static GameType ParseGameType(string gameType)
        {
            if (string.IsNullOrWhiteSpace(gameType))
                throw new ArgumentException("GameType is required.");

            var trimmed = gameType.Trim();
            if (string.Equals(trimmed, GameType.Basketball5v5.Value, StringComparison.OrdinalIgnoreCase))
                return GameType.Basketball5v5;
            if (string.Equals(trimmed, GameType.Basketball3v3.Value, StringComparison.OrdinalIgnoreCase))
                return GameType.Basketball3v3;
            if (string.Equals(trimmed, GameType.Futsal.Value, StringComparison.OrdinalIgnoreCase))
                return GameType.Futsal;

            throw new ArgumentException("Invalid GameType.");
        }
    }
}
