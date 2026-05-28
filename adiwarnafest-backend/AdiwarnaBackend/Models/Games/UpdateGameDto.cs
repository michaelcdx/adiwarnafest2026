namespace AdiwarnaBackend.Models.Games
{
    public class UpdateGameDto
    {
        public string? GameStatus { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public string? Remark { get; set; }

        // When true, Team1Id/Team2Id are applied (null = TBC). When false/omitted, teams are left unchanged.
        public bool SetTeams { get; set; }
        public Guid? Team1Id { get; set; }
        public Guid? Team2Id { get; set; }
    }
}