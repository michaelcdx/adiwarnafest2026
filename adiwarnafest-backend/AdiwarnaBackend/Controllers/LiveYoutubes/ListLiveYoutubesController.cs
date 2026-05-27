using AdiwarnaBackend.Data;
using AdiwarnaBackend.Models.LiveYoutubes;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.LiveYoutubes
{
    [Route("api/live-youtubes")]
    [ApiController]
    [Tags("LiveYoutubes")]
    public class ListLiveYoutubesController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List live YouTube entries")]
        [EndpointDescription("List all live YouTube entries. Public endpoint.")]
        public async Task<IActionResult> GetLiveYoutubes(CancellationToken cancellationToken)
        {
            var entries = await context.LiveYoutubes
                .AsNoTracking()
                .OrderBy(ly => ly.Status == "UPCOMING" ? 0 : ly.Status == "ONGOING" ? 1 : 2)
                .ThenBy(ly => ly.Title)
                .ToListAsync(cancellationToken);

            var dtos = entries.Select(ly => new LiveYoutubeDto
            {
                Id = ly.Id,
                Title = ly.Title,
                FilePath = ly.FilePath,
                Status = ly.Status,
                IsDeleted = ly.IsDeleted,
                DeletedAt = ly.DeletedAt
            }).ToList();

            return Ok(dtos);
        }
    }
}
