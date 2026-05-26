namespace AdiwarnaBackend.Models.LuckyDraw
{
    public class LuckyDrawEntryExportDto
    {
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string InstagramHandle { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
    }
}
