namespace AdiwarnaBackend.Models.Games
{
    public class GameDto
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public Guid Team1Id { get; set; }
        public Guid Team2Id { get; set; }
        public string Team1Name { get; set; } = string.Empty;
        public string Team2Name { get; set; } = string.Empty;
        public string GameStatus { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public string? Remark { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsLocked { get; set; }
        public int Team1Score { get; set; }
        public int Team2Score { get; set; }
        public List<PlayerGameStatDto> PlayerStats { get; set; } = new();
    }

    public class PlayerGameStatDto
    {
        public Guid PlayerId { get; set; }
        public string PlayerName { get; set; } = string.Empty;
        public int PlayerNumber { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int Goals { get; set; }
        public int Foul1 { get; set; }
        public int Foul2 { get; set; }
    }
}