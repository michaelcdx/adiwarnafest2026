using Ardalis.SmartEnum;

namespace AdiwarnaBackend.Enums
{
    public sealed class UserRole : SmartEnum<UserRole, string>
    {
        public static readonly UserRole Admin = new(nameof(Admin), "Admin");
        public static readonly UserRole Maintainer = new(nameof(Maintainer), "Maintainer");
        public static readonly UserRole Player = new(nameof(Player), "Player");

        public UserRole(string name, string value) : base(name, value)
        {
        }
    }
}