namespace AdiwarnaBackend.Models.Games
{
    public class PlayerStatInput
    {
        public Guid PlayerId { get; set; }
        public int Goals { get; set; }
        public int Foul1 { get; set; }
        public int Foul2 { get; set; }
    }

    public class TeamPlayerStatsInput
    {
        public Guid TeamId { get; set; }
        public List<PlayerStatInput> Players { get; set; } = new();
    }

    public class UpsertGameDto
    {
        public string GameStatus { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public string? Remark { get; set; }
        public Guid Team1Id { get; set; }
        public Guid Team2Id { get; set; }
        public List<TeamPlayerStatsInput> TeamStats { get; set; } = new();
    }
}