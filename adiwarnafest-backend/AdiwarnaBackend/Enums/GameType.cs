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
    }
}