using AdiwarnaBackend.Enums;
using AdiwarnaBackend.Entities;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Data.Seed
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(AdiwarnaDbContext context)
        {
            var adminEmail = "adiwarnafest@gmail.com";
            var adminNormalizedEmail = AuthValidation.NormalizeEmail(adminEmail);

            var adminExists = await context.Users.AnyAsync(u => u.NormalizedEmail == adminNormalizedEmail);

            if (!adminExists)
            {
                var adminUser = new User
                {
                    Email = adminEmail,
                    NormalizedEmail = adminNormalizedEmail,
                    Username = "Adiwarna",
                    Role = UserRole.Admin
                };

                adminUser.PasswordHash = new PasswordHasher<User>().HashPassword(adminUser, "Adiwarnaanjingcepetselesai123!");
                context.Users.Add(adminUser);
            }

            // Seed committee maintainers from spreadsheet
            var passwordHasher = new PasswordHasher<User>();
            foreach (var entry in MaintainerSeedData.Maintainers)
            {
                var email = $"{entry.StudentId}@xmu.edu.my";
                var normalizedEmail = AuthValidation.NormalizeEmail(email);

                var exists = await context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail);
                if (exists)
                    continue;

                var user = new User
                {
                    Email = email,
                    NormalizedEmail = normalizedEmail,
                    Username = entry.Name,
                    Role = UserRole.Maintainer
                };

                user.PasswordHash = passwordHasher.HashPassword(user, entry.GmailHandle);
                context.Users.Add(user);
            }

            await context.SaveChangesAsync();
        }
    }
}
