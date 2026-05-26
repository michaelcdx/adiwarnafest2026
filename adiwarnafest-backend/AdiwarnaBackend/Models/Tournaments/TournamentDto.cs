namespace AdiwarnaBackend.Models.Tournaments
{
    public class TournamentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string TourneyStatus { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public string? Remark { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsLocked { get; set; }
        public List<TournamentTeamDto> Teams { get; set; } = new();
    }

    public class TournamentTeamDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int? Placement { get; set; }
    }
}