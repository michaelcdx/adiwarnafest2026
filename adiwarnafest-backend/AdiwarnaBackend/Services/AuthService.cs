using AdiwarnaBackend.Data;
using AdiwarnaBackend.Entities;
using AdiwarnaBackend.Enums;
using AdiwarnaBackend.Models.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AdiwarnaBackend.Services
{
    public class AuthService(AdiwarnaDbContext context, IConfiguration configuration) : IAuthService
    {
        public async Task<TokenResponseDto?> LoginAsync(LoginRequestDto request, string? ipAddress, string? userAgent)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (user is null)
            {
                return null;
            }
            if (user.IsDisabled)
            {
                return null;
            }
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password)
                == PasswordVerificationResult.Failed)
            {
                return null;
            }

            return await CreateTokenResponse(user, ipAddress, userAgent);
        }

        private async Task<TokenResponseDto> CreateTokenResponse(User user, string? ipAddress, string? userAgent)
        {
            var refreshToken = GenerateRefreshToken();
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                TokenHash = HashToken(refreshToken),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress,
                CreatedByUserAgent = userAgent
            };

            context.RefreshTokens.Add(refreshTokenEntity);
            await context.SaveChangesAsync();

            return new TokenResponseDto
            {
                UserId = user.Id,
                AccessToken = CreateToken(user),
                RefreshToken = refreshToken
            };
        }

        public async Task<TokenResponseDto?> RefreshTokensAsync(RefreshTokenRequestDto request, string? ipAddress, string? userAgent)
        {
            var refreshToken = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);
            if (refreshToken?.User is null)
                return null;

            var newRefreshToken = GenerateRefreshToken();
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = refreshToken.UserId,
                TokenHash = HashToken(newRefreshToken),
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress,
                CreatedByUserAgent = userAgent
            };

            context.RefreshTokens.Add(newRefreshTokenEntity);
            await context.SaveChangesAsync();

            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.ReplacedByTokenId = newRefreshTokenEntity.Id;
            await context.SaveChangesAsync();

            return new TokenResponseDto
            {
                UserId = refreshToken.UserId,
                AccessToken = CreateToken(refreshToken.User),
                RefreshToken = newRefreshToken
            };
        }

        public async Task<bool> RevokeRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var tokenHash = HashToken(refreshToken);
            var token = await context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.UserId == userId
                    && rt.TokenHash == tokenHash
                    && rt.RevokedAt == null
                    && rt.ExpiresAt > DateTime.UtcNow);

            if (token is null)
                return false;

            token.RevokedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<int> RevokeAllRefreshTokensAsync(Guid userId)
        {
            var tokens = await context.RefreshTokens
                .Where(rt => rt.UserId == userId
                    && rt.RevokedAt == null
                    && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            if (tokens.Count == 0)
                return 0;

            var now = DateTime.UtcNow;
            foreach (var token in tokens)
            {
                token.RevokedAt = now;
            }

            await context.SaveChangesAsync();
            return tokens.Count;
        }

        public async Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequestDto request)
        {
            try
            {
                AuthValidation.ValidateEmail(request.Email);
                AuthValidation.ValidatePassword(request.Password);
            }
            catch (ArgumentException ex)
            {
                return (false, ex.Message);
            }

            var normalizedEmail = AuthValidation.NormalizeEmail(request.Email);

            var existingUser = await context.Users
                .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

            if (existingUser is not null)
            {
                return (false, "An account with this email already exists.");
            }

            var username = request.Email.Split('@')[0];

            var newUser = new User
            {
                Email = request.Email.Trim(),
                NormalizedEmail = normalizedEmail,
                Username = username,
                Role = UserRole.Player,
                IsDisabled = false
            };

            newUser.PasswordHash = new PasswordHasher<User>().HashPassword(newUser, request.Password);

            context.Users.Add(newUser);
            await context.SaveChangesAsync();

            return (true, null);
        }

        public async Task<bool> DeleteAccountAsync(DeleteAccountRequestDto request)
        {
            var normalizedEmail = AuthValidation.NormalizeEmail(request.Email);
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (user is null)
                return false;

            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, request.Password)
                == PasswordVerificationResult.Failed)
                return false;

            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return true;
        }

        private async Task<RefreshToken?> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
        {
            var tokenHash = HashToken(refreshToken);
            var token = await context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.UserId == userId
                    && rt.TokenHash == tokenHash
                    && rt.RevokedAt == null
                    && rt.ExpiresAt > DateTime.UtcNow);

            return token;
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private static string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(token);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration.GetValue<string>("AppSettings:Token")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>("AppSettings:Issuer"),
                audience: configuration.GetValue<string>("AppSettings:Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
