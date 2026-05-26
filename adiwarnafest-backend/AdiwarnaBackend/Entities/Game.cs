using AdiwarnaBackend.Enums;

namespace AdiwarnaBackend.Entities
{
    public class Game
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public Guid Team1Id { get; set; }
        public Guid Team2Id { get; set; }
        public string GameStatus { get; set; } = TournamentStatus.UPCOMING.Name;
        public DateTime ScheduledAt { get; set; }
        public string? Remark { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsLocked { get; set; } = false;

        public Tournament Tournament { get; set; } = null!;
        public Team Team1 { get; set; } = null!;
        public Team Team2 { get; set; } = null!;
        public ICollection<PlayerGameStat> PlayerGameStats { get; set; } = new List<PlayerGameStat>();
    }
}