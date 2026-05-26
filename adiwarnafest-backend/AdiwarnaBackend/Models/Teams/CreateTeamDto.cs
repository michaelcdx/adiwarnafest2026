namespace AdiwarnaBackend.Models.Teams
{
    public class CreateTeamDto
    {
        public string Name { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public bool IsLocked { get; set; } = false;
        public List<TeamPlayerDto> Players { get; set; } = new();
    }
}
