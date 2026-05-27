using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.LiveYoutubes
{
    [Route("api/live-youtubes")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("LiveYoutubes")]
    public class DeleteLiveYoutubeController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpDelete("{id:guid}")]
        [EndpointSummary("Delete live YouTube entry")]
        [EndpointDescription("Soft delete a live YouTube entry. Requires Admin or Maintainer.")]
        public async Task<IActionResult> DeleteLiveYoutube(Guid id, CancellationToken cancellationToken)
        {
            var entry = await context.LiveYoutubes
                .FirstOrDefaultAsync(ly => ly.Id == id, cancellationToken);

            if (entry is null)
                return NotFound("Live YouTube entry not found.");

            entry.IsDeleted = true;
            entry.DeletedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
    }
}
