using AdiwarnaBackend.Entities;
using AdiwarnaBackend.Models.Auth;

namespace AdiwarnaBackend.Services
{
    public interface IAuthService
    {
        Task<TokenResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress, string? userAgent);
        Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request, string? ipAddress, string? userAgent);
        Task<bool> RevokeRefreshTokenAsync(Guid userId, string refreshToken);
        Task<int> RevokeAllRefreshTokensAsync(Guid userId);
        Task<bool> DeleteAccountAsync(DeleteAccountRequestDto request);
        Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequestDto request);
    }
}
