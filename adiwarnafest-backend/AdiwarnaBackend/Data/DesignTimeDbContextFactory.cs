using AdiwarnaBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.Text.Json;

namespace AdiwarnaBackend.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AdiwarnaDbContext>
    {
        public AdiwarnaDbContext CreateDbContext(string[] args)
        {
            var basePath = Directory.GetCurrentDirectory();
            var appsettingsPath = Path.Combine(basePath, "appsettings.json");

            if (!File.Exists(appsettingsPath))
                throw new FileNotFoundException($"appsettings.json not found at {appsettingsPath}");

            var json = File.ReadAllText(appsettingsPath);
            using var doc = JsonDocument.Parse(json);
            var connectionString = doc.RootElement
                .GetProperty("ConnectionStrings")
                .GetProperty("AdiwarnaDatabase")
                .GetString();

            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException("AdiwarnaDatabase connection string not found in appsettings.json");

            var optionsBuilder = new DbContextOptionsBuilder<AdiwarnaDbContext>();
            optionsBuilder.UseNpgsql(connectionString);
            return new AdiwarnaDbContext(optionsBuilder.Options);
        }
    }
}