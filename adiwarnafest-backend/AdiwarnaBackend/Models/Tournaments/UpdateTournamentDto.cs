namespace AdiwarnaBackend.Models.Tournaments
{
    public class UpdateTournamentDto
    {
        public string? Name { get; set; }
        public string? TourneyStatus { get; set; }
        public string? GameType { get; set; }
        public string? Remark { get; set; }
        public List<Guid>? TeamIds { get; set; }
    }
}