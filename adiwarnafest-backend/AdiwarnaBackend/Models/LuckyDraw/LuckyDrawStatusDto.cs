namespace AdiwarnaBackend.Models.LuckyDraw
{
    public class LuckyDrawStatusDto
    {
        public List<QrScanDto> ScannedBooths { get; set; } = new();
        public bool IsEligible { get; set; }
        public bool HasSubmitted { get; set; }
    }
}
