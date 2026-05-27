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
    public class CreateLiveYoutubeController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpPost]
        [EndpointSummary("Create live YouTube entry")]
        [EndpointDescription("Create a new live YouTube entry. Requires Admin or Maintainer.")]
        public async Task<IActionResult> CreateLiveYoutube([FromBody] CreateLiveYoutubeDto request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest("Title is required.");
            if (string.IsNullOrWhiteSpace(request.FilePath))
                return BadRequest("FilePath is required.");

            string status;
            try { status = ParseStatus(request.Status); }
            catch (ArgumentException) { return BadRequest("Invalid Status."); }

            var entry = new Entities.LiveYoutube
            {
                Title = request.Title,
                FilePath = request.FilePath,
                Status = status
            };

            context.LiveYoutubes.Add(entry);
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
