namespace AdiwarnaBackend.Models.Users
{
    public class AdminUpdateUserDto
    {
        public string? Username { get; set; }
        public string? Role { get; set; }
        public bool? IsDisabled { get; set; }
        public string? DisabledReason { get; set; }
    }
}
