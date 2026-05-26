namespace AdiwarnaBackend.Models.Games
{
    public class CreateGameDto
    {
        public Guid Team1Id { get; set; }
        public Guid Team2Id { get; set; }
        public string GameStatus { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public string? Remark { get; set; }
    }
}