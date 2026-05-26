using AdiwarnaBackend.Enums;

namespace AdiwarnaBackend.Entities
{
    public class Tournament
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string TourneyStatus { get; set; } = TournamentStatus.UPCOMING.Name;
        public string GameType { get; set; } = string.Empty;
        public string? Remark { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsLocked { get; set; } = false;

        public ICollection<TournamentTeam> TournamentTeams { get; set; } = new List<TournamentTeam>();
        public ICollection<Game> Games { get; set; } = new List<Game>();
    }
}