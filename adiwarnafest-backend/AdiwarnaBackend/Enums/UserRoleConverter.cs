using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AdiwarnaBackend.Enums
{
    public class UserRoleConverter : ValueConverter<UserRole, string>
    {
        public UserRoleConverter() : base(role => role.Value, value => UserRole.FromValue(value))
        {
        }
    }
}
