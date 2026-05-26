namespace AdiwarnaBackend.Models.Teams
{
    public class UpdateTeamDto
    {
        public string? Name { get; set; }
        public string? GameType { get; set; }
        // null = leave players unchanged; [] = remove all players; non-empty = replace player list
        public List<TeamPlayerDto>? Players { get; set; }
    }
}
