using AdiwarnaBackend.Data;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Uploads
{
    [Route("api/uploads")]
    [ApiController]
    [Authorize(Roles = "Admin,Maintainer")]
    [Tags("Uploads")]
    public class TeamLogoUploadController(AdiwarnaDbContext context, IFileStorageService fileStorageService) : ControllerBase
    {
        private const long MaxFileSizeBytes = 5 * 1024 * 1024;

        [HttpPost("team-logo")]
        [RequestSizeLimit(MaxFileSizeBytes)]
        [EndpointSummary("Upload team logo")]
        [EndpointDescription("Upload a team logo (max 5MB). Overwrites any existing logo.")]
        public async Task<IActionResult> UploadTeamLogo([FromForm] Guid teamId, [FromForm] IFormFile file, CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
                return BadRequest("File is required.");

            if (file.Length > MaxFileSizeBytes)
                return BadRequest("File exceeds 5MB limit.");

            var team = await context.Teams.FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);
            if (team is null)
                return NotFound("Team not found.");

            if (!IsAllowedImage(file.ContentType, file.FileName))
                return BadRequest("Only .png, .jpg, .jpeg, or .webp files are allowed.");

            await using var stream = file.OpenReadStream();
            var logoPath = await fileStorageService.SaveTeamLogoAsync(stream, file.FileName, teamId, cancellationToken);

            team.LogoPath = logoPath;
            await context.SaveChangesAsync(cancellationToken);

            return Ok(new { LogoPath = logoPath });
        }

        private static bool IsAllowedImage(string contentType, string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return contentType is "image/png" or "image/jpeg" or "image/webp"
                && extension is ".png" or ".jpg" or ".jpeg" or ".webp";
        }
    }
}
