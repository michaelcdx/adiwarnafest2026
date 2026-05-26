using Ardalis.SmartEnum;

namespace AdiwarnaBackend.Enums
{
    public sealed class TournamentStatus : SmartEnum<TournamentStatus, string>
    {
        public static readonly TournamentStatus UPCOMING = new(nameof(UPCOMING), "UPCOMING");
        public static readonly TournamentStatus ONGOING = new(nameof(ONGOING), "ONGOING");
        public static readonly TournamentStatus COMPLETED = new(nameof(COMPLETED), "COMPLETED");

        public TournamentStatus(string name, string value) : base(name, value)
        {
        }
    }
}