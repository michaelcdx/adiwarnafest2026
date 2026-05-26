using AdiwarnaBackend.Data;
using AdiwarnaBackend.Entities;
using AdiwarnaBackend.Enums;
using AdiwarnaBackend.Models.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Services
{
    public class UserManagementService(AdiwarnaDbContext context) : IUserManagementService
    {
        public async Task<User?> CreateUserAsync(AdminCreateUserDto request)
        {
            AuthValidation.ValidateEmail(request.Email);
            AuthValidation.ValidatePassword(request.Password);

            var email = request.Email.Trim().ToLowerInvariant();
            if (await context.Users.AnyAsync(u => u.Email.ToLower() == email))
            {
                return null;
            }

            var role = ParseRole(request.Role);
            if (role == UserRole.Admin)
                throw new ArgumentException("Admin role cannot be assigned via this API.");

            var normalizedEmail = AuthValidation.NormalizeEmail(request.Email);
            var user = new User
            {
                Email = email,
                NormalizedEmail = normalizedEmail,
                Username = request.Username.Trim().ToUpperInvariant(),
                Role = role
            };

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, request.Password);
            context.Users.Add(user);
            await context.SaveChangesAsync();

            return user;
        }

        public async Task<User?> UpdateUserAsync(Guid userId, AdminUpdateUserDto request)
        {
            var user = await context.Users.FindAsync(userId);
            if (user is null)
                return null;

            if (user.Role == UserRole.Admin && request.IsDisabled == true)
                throw new ArgumentException("Admin users cannot be disabled.");

            if (user.Role == UserRole.Admin && !string.IsNullOrWhiteSpace(request.Role))
                throw new ArgumentException("Admin role cannot be changed via this API.");

            if (!string.IsNullOrWhiteSpace(request.Username))
                user.Username = request.Username.Trim();

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var role = ParseRole(request.Role);
                if (role == UserRole.Admin)
                    throw new ArgumentException("Admin role cannot be assigned via this API.");

                user.Role = role;
            }

            if (request.IsDisabled.HasValue)
            {
                user.IsDisabled = request.IsDisabled.Value;
                user.DisabledAt = user.IsDisabled ? DateTime.UtcNow : null;
                user.DisabledReason = user.IsDisabled ? request.DisabledReason : null;
            }

            await context.SaveChangesAsync();
            return user;
        }

        public Task<User?> GetUserAsync(Guid userId)
        {
            return context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        public Task<List<User>> GetUsersAsync(bool includeDisabled)
        {
            var query = context.Users.AsQueryable();
            if (!includeDisabled)
            {
                query = query.Where(u => !u.IsDisabled);
            }

            return query.OrderBy(u => u.Username).ToListAsync();
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await context.Users.FindAsync(userId);
            if (user is null)
                return false;

            if (user.Role == UserRole.Admin)
                throw new ArgumentException("Admin users cannot be deleted.");

            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPasswordAsync(Guid userId, AdminResetPasswordDto request)
        {
            AuthValidation.ValidatePassword(request.NewPassword);

            var user = await context.Users.FindAsync(userId);
            if (user is null)
                return false;

            if (user.Role == UserRole.Admin)
                throw new ArgumentException("Admin password cannot be reset via this API.");

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, request.NewPassword);
            await context.SaveChangesAsync();
            return true;
        }

        private static UserRole ParseRole(string role)
        {
            if (string.IsNullOrWhiteSpace(role))
                return UserRole.Maintainer;

            var trimmedRole = role.Trim();
            if (string.Equals(trimmedRole, UserRole.Admin.Value, StringComparison.OrdinalIgnoreCase))
                return UserRole.Admin;
            if (string.Equals(trimmedRole, UserRole.Maintainer.Value, StringComparison.OrdinalIgnoreCase))
                return UserRole.Maintainer;
            if (string.Equals(trimmedRole, UserRole.Player.Value, StringComparison.OrdinalIgnoreCase))
                return UserRole.Player;

            throw new ArgumentException("Invalid role. Use Maintainer or Player.");
        }
    }
}
