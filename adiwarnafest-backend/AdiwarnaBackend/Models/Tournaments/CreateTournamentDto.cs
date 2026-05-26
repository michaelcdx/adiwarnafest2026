namespace AdiwarnaBackend.Models.Tournaments
{
    public class CreateTournamentDto
    {
        public string Name { get; set; } = string.Empty;
        public string TourneyStatus { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public string? Remark { get; set; }
        public bool IsLocked { get; set; } = false;
        public List<Guid> TeamIds { get; set; } = new();
    }
}