namespace AdiwarnaBackend.Models.Auth
{
    public class TokenResponseDto
    {
        public Guid UserId { get; set; }
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}
