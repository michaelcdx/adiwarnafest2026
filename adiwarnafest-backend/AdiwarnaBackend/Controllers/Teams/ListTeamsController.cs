using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Teams
{
    [Route("api/teams")]
    [ApiController]
    [Tags("Teams")]
    public class ListTeamsController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet]
        [EndpointSummary("List teams")]
        [EndpointDescription("Public list of teams.")]
        public async Task<IActionResult> GetTeams([FromQuery] bool includeDeleted = false)
        {
            var query = context.Teams.AsNoTracking();
            if (includeDeleted)
            {
                query = query.IgnoreQueryFilters();
            }

            var teams = await query
                .OrderBy(team => EF.Property<string>(team, "GameType"))
                .ThenBy(team => team.Id)
                .ToListAsync();

            return Ok(teams);
        }
    }
}
