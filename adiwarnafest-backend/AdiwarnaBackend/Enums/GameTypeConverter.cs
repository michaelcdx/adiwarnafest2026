using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AdiwarnaBackend.Enums
{
    public class GameTypeConverter : ValueConverter<GameType, string>
    {
        public GameTypeConverter() : base(type => type.Value, value => GameType.FromValue(value))
        {
        }
    }
}
