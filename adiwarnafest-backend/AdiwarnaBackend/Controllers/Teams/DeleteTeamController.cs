using AdiwarnaBackend.Data;
using AdiwarnaBackend.Services;
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
    public class DeleteTeamController(AdiwarnaDbContext context, IFileStorageService fileStorageService) : ControllerBase
    {
        [HttpDelete("{id:guid}")]
        [EndpointSummary("Delete team")]
        [EndpointDescription("Soft delete a team. Requires Admin or Maintainer. Logo file is permanently deleted. Locked teams cannot be deleted.")]
        public async Task<IActionResult> DeleteTeam(Guid id)
        {
            var team = await context.Teams.FirstOrDefaultAsync(t => t.Id == id);
            if (team is null)
                return NotFound();

            if (team.IsLocked)
                return StatusCode(403, "Team is locked and cannot be deleted.");

            if (!string.IsNullOrEmpty(team.LogoPath))
            {
                try
                {
                    await fileStorageService.DeleteTeamLogoAsync(team.LogoPath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Warning: Failed to delete logo file for team {id}. Error: {ex.Message}");
                }
            }

            team.IsDeleted = true;
            team.DeletedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
            return Ok();
        }
    }
}
