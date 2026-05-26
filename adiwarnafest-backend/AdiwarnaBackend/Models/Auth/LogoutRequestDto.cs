namespace AdiwarnaBackend.Models.Auth
{
    public class LogoutRequestDto
    {
        public Guid UserId { get; set; }
        public required string RefreshToken { get; set; }
    }
}
