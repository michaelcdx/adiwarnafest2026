using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Players
{
    [Route("api/players")]
    [ApiController]
    [Tags("Players")]
    public class ListPlayersController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List players")]
        [EndpointDescription("Public list of players. Use teamId to filter.")]
        public async Task<IActionResult> GetPlayers([FromQuery] Guid? teamId, [FromQuery] bool includeDeleted = false)
        {
            var query = context.Players.AsNoTracking();
            if (includeDeleted)
            {
                query = query.IgnoreQueryFilters();
            }
            if (teamId.HasValue)
                query = query.Where(player => player.TeamId == teamId.Value);

            var players = await query
                .OrderBy(player => player.Id)
                .ToListAsync();

            return Ok(players);
        }
    }
}
