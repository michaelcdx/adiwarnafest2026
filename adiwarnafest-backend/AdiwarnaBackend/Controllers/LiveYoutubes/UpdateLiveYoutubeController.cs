using AdiwarnaBackend.Data;
using AdiwarnaBackend.Enums;
using AdiwarnaBackend.Models.LiveYoutubes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.LiveYoutubes
{
    [Route("api/live-youtubes")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("LiveYoutubes")]
    public class UpdateLiveYoutubeController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPatch("{id:guid}")]
        [EndpointSummary("Update live YouTube entry")]
        [EndpointDescription("Update live YouTube entry metadata (title, filepath, status). Requires Admin or Maintainer.")]
        public async Task<IActionResult> UpdateLiveYoutube(Guid id, [FromBody] UpdateLiveYoutubeDto request, CancellationToken cancellationToken)
        {
            var entry = await context.LiveYoutubes
                .FirstOrDefaultAsync(ly => ly.Id == id, cancellationToken);

            if (entry is null)
                return NotFound("Live YouTube entry not found.");

            if (!string.IsNullOrWhiteSpace(request.Title))
                entry.Title = request.Title;

            if (!string.IsNullOrWhiteSpace(request.FilePath))
                entry.FilePath = request.FilePath;

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                string status;
                try { status = ParseStatus(request.Status); }
                catch (ArgumentException) { return BadRequest("Invalid Status."); }
                entry.Status = status;
            }

            await context.SaveChangesAsync(cancellationToken);

            return Ok(new LiveYoutubeDto
            {
                Id = entry.Id,
                Title = entry.Title,
                FilePath = entry.FilePath,
                Status = entry.Status,
                IsDeleted = entry.IsDeleted,
                DeletedAt = entry.DeletedAt
            });
        }

        private static string ParseStatus(string status)
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

            throw new ArgumentException("Invalid Status.");
        }
    }
}
