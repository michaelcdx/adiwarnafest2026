using AdiwarnaBackend.Data;
using AdiwarnaBackend.Enums;
using AdiwarnaBackend.Models.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Controllers.Public
{
    [Route("api/public")]
    [ApiController]
    [Tags("Public")]
    public class DropdownOptionsController(AdiwarnaDbContext context) : ControllerBase
    {
        [HttpGet("dropdown-options")]
        [EndpointSummary("Public dropdown options")]
        [EndpointDescription("Return dropdown options based on the requested type. Supports userrole, gametype, and team.")]
        public async Task<IActionResult> GetDropdownOptions([FromQuery] string? type)
        {
            var result = new List<DropdownDto>();
            if (string.IsNullOrWhiteSpace(type))
                return Ok(result);

            var types = type.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            foreach (var entry in types)
            {
                var normalizedType = entry.ToLowerInvariant();
                var options = normalizedType switch
                {
                    "userrole" => UserRole.List
                        .Where(role => role != UserRole.Admin)
                        .Select(role => new DropdownOptionDto
                        {
                            Id = role.Value,
                            Code = role.Value,
                            Description = role.Value
                        })
                        .ToList(),
                    "gametype" => GameType.List
                        .Select(gameType => new DropdownOptionDto
                        {
                            Id = gameType.Value,
                            Code = gameType.Value,
                            Description = gameType.Value
                        })
                        .ToList(),
                    "team" => await context.Teams
                        .AsNoTracking()
                        .OrderBy(team => team.Name)
                        .Select(team => new DropdownOptionDto
                        {
                            Id = team.Id.ToString(),
                            Code = team.Name,
                            Description = team.GameType
                        })
                        .ToListAsync(),
                    "tournament" => await context.Tournaments
                        .AsNoTracking()
                        .OrderBy(t => t.Name)
                        .Select(t => new DropdownOptionDto
                        {
                            Id = t.Id.ToString(),
                            Code = t.Name,
                            Description = t.Name
                        })
                        .ToListAsync(),
                    _ => []
                };

                result.Add(new DropdownDto
                {
                    Type = entry,
                    Options = options
                });
            }

            return Ok(result);
        }
    }
}
