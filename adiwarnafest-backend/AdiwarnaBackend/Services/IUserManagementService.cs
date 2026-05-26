using AdiwarnaBackend.Entities;
using AdiwarnaBackend.Models.Users;

namespace AdiwarnaBackend.Services
{
    public interface IUserManagementService
    {
        Task<User?> CreateUserAsync(AdminCreateUserDto request);
        Task<User?> UpdateUserAsync(Guid userId, AdminUpdateUserDto request);
        Task<User?> GetUserAsync(Guid userId);
        Task<List<User>> GetUsersAsync(bool includeDisabled);
        Task<bool> DeleteUserAsync(Guid userId);
        Task<bool> ResetPasswordAsync(Guid userId, AdminResetPasswordDto request);
    }
}
