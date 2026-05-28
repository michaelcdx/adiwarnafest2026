using Ardalis.SmartEnum;

namespace AdiwarnaBackend.Enums
{
    public sealed class GameType : SmartEnum<GameType, string>
    {
        public static readonly GameType Basketball5v5 = new(nameof(Basketball5v5), "Basketball5v5");
        public static readonly GameType Futsal = new(nameof(Futsal), "Futsal");
        public static readonly GameType MobileLegends = new(nameof(MobileLegends), "Mobile Legends");

        public GameType(string name, string value) : base(name, value)
        {
        }

        // Teams persist the SmartEnum Value (e.g. "Mobile Legends") while
        // tournaments persist the raw Name (e.g. "MobileLegends"), so treat both
        // spellings of the same game type as equal.
        public static bool ValuesMatch(string a, string b)
        {
            if (string.Equals(a, b, StringComparison.OrdinalIgnoreCase))
                return true;

            var matchedA = List.FirstOrDefault(gt =>
                string.Equals(gt.Name, a, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(gt.Value, a, StringComparison.OrdinalIgnoreCase));
            var matchedB = List.FirstOrDefault(gt =>
                string.Equals(gt.Name, b, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(gt.Value, b, StringComparison.OrdinalIgnoreCase));

            return matchedA is not null && matchedA == matchedB;
        }
    }
}