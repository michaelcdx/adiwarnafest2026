using AdiwarnaBackend.Data;
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
    public class GetLiveYoutubeController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        [EndpointSummary("Get live YouTube entry")]
        [EndpointDescription("Get a single live YouTube entry by ID. Requires Admin or Maintainer.")]
        public async Task<IActionResult> GetLiveYoutube(Guid id, CancellationToken cancellationToken)
        {
            var entry = await context.LiveYoutubes
                .AsNoTracking()
                .FirstOrDefaultAsync(ly => ly.Id == id, cancellationToken);

            if (entry is null)
                return NotFound("Live YouTube entry not found.");

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
    }
}
