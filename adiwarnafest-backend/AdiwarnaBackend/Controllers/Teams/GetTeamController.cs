using AdiwarnaBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Teams
{
    [Route("api/teams")]
    [ApiController]
    [Tags("Teams")]
    public class GetTeamController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet("{id:guid}")]
        [EndpointSummary("Get team")]
        [EndpointDescription("Public read of a team by id. Includes players roster.")]
        public async Task<IActionResult> GetTeam(Guid id)
        {
            var team = await context.Teams
                .AsNoTracking()
                .Include(t => t.Players)
                .FirstOrDefaultAsync(team => team.Id == id);

            if (team is null)
                return NotFound();

            return Ok(team);
        }
    }
}
