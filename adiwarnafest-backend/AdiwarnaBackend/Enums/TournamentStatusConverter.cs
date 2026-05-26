using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AdiwarnaBackend.Enums
{
    public class TournamentStatusConverter : ValueConverter<TournamentStatus, string>
    {
        public TournamentStatusConverter() : base(status => status.Value, value => TournamentStatus.FromValue(value))
        {
        }
    }
}
