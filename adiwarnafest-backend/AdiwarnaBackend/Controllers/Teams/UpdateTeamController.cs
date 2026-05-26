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
    public class UpdateTeamController(AdiwarnaDbContext context) : ControllerBase
    {

        [HttpPatch("{id:guid}")]
        [EndpointSummary("Update team")]
        [EndpointDescription("Update a team. Name, GameType, and players can be edited. Use DELETE endpoint to delete. Use the lock endpoint to lock/unlock a team. Requires Admin or Maintainer.")]
        public async Task<IActionResult> UpdateTeam(Guid id, [FromBody] UpdateTeamDto request, CancellationToken cancellationToken)
        {
            var team = await context.Teams
                .Include(t => t.Players)
                .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
            
            if (team is null)
                return NotFound();

            if (team.IsLocked)
            {
                if (!string.IsNullOrWhiteSpace(request.Name) ||
                    !string.IsNullOrWhiteSpace(request.GameType) ||
                    (request.Players != null && request.Players.Any()))
                {
                    return StatusCode(403, "Team is locked and cannot be modified.");
                }
            }

            await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                if (!string.IsNullOrWhiteSpace(request.Name))
                    team.Name = request.Name.Trim().ToUpperInvariant();
                else if (request.Name is not null)
                    return BadRequest("Team name cannot be empty.");

                if (!string.IsNullOrWhiteSpace(request.GameType))
                {
                    GameType gameType;
                    try { gameType = ParseGameType(request.GameType); }
                    catch (ArgumentException ex) { return BadRequest(ex.Message); }
                    team.GameType = gameType;
                }

                if (request.Players != null)
                {
                    var existingPlayerIds = team.Players.Select(p => p.Id).ToHashSet();
                    var processedPlayerIds = new HashSet<Guid>();
                    var playerNumbers = new HashSet<int>();

                    foreach (var playerDto in request.Players)
                    {
                        if (string.IsNullOrWhiteSpace(playerDto.Name))
                            return BadRequest("Player name is required.");

                        if (playerDto.PlayerNumber < 0 || playerDto.PlayerNumber > 99)
                            return BadRequest($"Player number must be between 0 and 99.");

                        if (playerDto.Id.HasValue)
                        {
                            var existingPlayer = team.Players.FirstOrDefault(p => p.Id == playerDto.Id.Value);
                            if (existingPlayer is null)
                                return NotFound($"Player with ID {playerDto.Id.Value} not found in this team.");

                            if (!playerNumbers.Add(playerDto.PlayerNumber))
                                return BadRequest($"Duplicate player number {playerDto.PlayerNumber} in team.");

                            existingPlayer.Name = playerDto.Name.Trim().ToUpperInvariant();
                            existingPlayer.PlayerNumber = playerDto.PlayerNumber;
                            processedPlayerIds.Add(existingPlayer.Id);
                        }
                        else
                        {
                            if (!playerNumbers.Add(playerDto.PlayerNumber))
                                return BadRequest($"Duplicate player number {playerDto.PlayerNumber} in team.");

                        var newPlayer = new Entities.Player
                        {
                            Id = Guid.NewGuid(),
                            TeamId = team.Id,
                            Name = playerDto.Name.Trim().ToUpperInvariant(),
                            PlayerNumber = playerDto.PlayerNumber
                        };

                        context.Players.Add(newPlayer);
                        processedPlayerIds.Add(newPlayer.Id);
                    }
                    }

                    var playersToDelete = team.Players.Where(p => !processedPlayerIds.Contains(p.Id)).ToList();
                    foreach (var player in playersToDelete)
                    {
                        context.Players.Remove(player);
                    }
                }

                await context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                var updatedTeam = await context.Teams
                    .Include(t => t.Players)
                    .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

                return Ok(updatedTeam);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
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
            if (string.Equals(trimmed, GameType.Futsal.Value, StringComparison.OrdinalIgnoreCase))
                return GameType.Futsal;
            if (string.Equals(trimmed, GameType.MobileLegends.Value, StringComparison.OrdinalIgnoreCase))
                return GameType.MobileLegends;

            throw new ArgumentException("Invalid GameType.");
        }
    }
}
