namespace AdiwarnaBackend.Models.Tournaments
{
    public class UpdateTournamentPlacementDto
    {
        public Guid TeamId { get; set; }
        public int? Placement { get; set; }
    }
}