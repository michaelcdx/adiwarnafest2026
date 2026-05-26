using Ardalis.SmartEnum;

namespace AdiwarnaBackend.Enums
{
    public sealed class GameType : SmartEnum<GameType, string>
    {
        public static readonly GameType Basketball5v5 = new(nameof(Basketball5v5), "Basketball5v5");
        public static readonly GameType Basketball3v3 = new(nameof(Basketball3v3), "Basketball3v3");
        public static readonly GameType Futsal = new(nameof(Futsal), "Futsal");

        public GameType(string name, string value) : base(name, value)
        {
        }
    }
}