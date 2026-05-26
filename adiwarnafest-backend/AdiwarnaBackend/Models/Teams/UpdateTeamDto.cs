namespace AdiwarnaBackend.Models.Teams
{
    public class UpdateTeamDto
    {
        public string? Name { get; set; }
        public string? GameType { get; set; }
        public List<TeamPlayerDto> Players { get; set; } = new();
    }
}
