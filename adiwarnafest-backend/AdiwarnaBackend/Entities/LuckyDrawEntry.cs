namespace AdiwarnaBackend.Entities
{
    public class LuckyDrawEntry
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string InstagramHandle { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
