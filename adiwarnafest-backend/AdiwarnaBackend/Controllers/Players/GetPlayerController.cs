using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Players
{
    [Route("api/players")]
    [ApiController]
    [Tags("Players")]
    public class GetPlayerController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        [EndpointSummary("Get player")]
        [EndpointDescription("Public read of a player by id.")]
        public async Task<IActionResult> GetPlayer(Guid id)
        {
            var player = await context.Players
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (player is null)
                return NotFound();

            return Ok(player);
        }
    }
}
