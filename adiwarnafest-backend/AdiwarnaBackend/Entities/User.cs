using AdiwarnaBackend.Enums;
using System.Text.Json.Serialization;

namespace AdiwarnaBackend.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string NormalizedEmail { get; set; } = string.Empty;
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = UserRole.Maintainer.Name;
        public bool IsDisabled { get; set; }
        public DateTime? DisabledAt { get; set; }
        public string? DisabledReason { get; set; }
        [JsonIgnore]
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        [JsonIgnore]
        public ICollection<QrScan> QrScans { get; set; } = new List<QrScan>();

        [JsonIgnore]
        public LuckyDrawEntry? LuckyDrawEntry { get; set; }
    }
}
