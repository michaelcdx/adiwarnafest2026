using AdiwarnaBackend.Enums;

namespace AdiwarnaBackend.Entities
{
    public class LiveYoutube
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string Status { get; set; } = TournamentStatus.UPCOMING.Name;
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
