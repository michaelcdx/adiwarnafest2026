namespace AdiwarnaBackend.Entities
{
    public class QrScan
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string BoothId { get; set; } = string.Empty;
        public DateTime ScannedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
