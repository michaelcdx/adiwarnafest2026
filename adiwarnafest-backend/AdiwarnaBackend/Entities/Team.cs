using AdiwarnaBackend.Enums;

namespace AdiwarnaBackend.Entities
{
    public class Team
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string GameType { get; set; } = "Basketball5v5";
        public int Wins { get; set; }
        public int Losses { get; set; }
        public string? LogoPath { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsLocked { get; set; } = false;

        public ICollection<Player> Players { get; set; } = new List<Player>();
        public ICollection<TournamentTeam> TournamentTeams { get; set; } = new List<TournamentTeam>();
    }
}
