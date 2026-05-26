namespace AdiwarnaBackend.Entities
{
    public class PlayerGameStat
    {
        public Guid GameId { get; set; }
        public Guid PlayerId { get; set; }
        public int Goals { get; set; } = 0;
        public int Foul1 { get; set; } = 0;
        public int Foul2 { get; set; } = 0;

        public Game Game { get; set; } = null!;
        public Player Player { get; set; } = null!;
    }
}