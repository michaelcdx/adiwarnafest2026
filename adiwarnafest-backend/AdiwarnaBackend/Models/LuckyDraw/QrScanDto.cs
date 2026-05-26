namespace AdiwarnaBackend.Models.LuckyDraw
{
    public class QrScanDto
    {
        public Guid Id { get; set; }
        public string BoothId { get; set; } = string.Empty;
        public DateTime ScannedAt { get; set; }
    }
}
