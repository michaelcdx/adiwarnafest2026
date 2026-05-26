namespace AdiwarnaBackend.Entities
{
    public class TournamentTeam
    {
        public Guid TournamentId { get; set; }
        public Guid TeamId { get; set; }
        public int? Placement { get; set; }

        public Tournament Tournament { get; set; } = null!;
        public Team Team { get; set; } = null!;
    }
}