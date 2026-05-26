namespace AdiwarnaBackend.Models.Games
{
    public class UpdateGameDto
    {
        public string? GameStatus { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public string? Remark { get; set; }
    }
}