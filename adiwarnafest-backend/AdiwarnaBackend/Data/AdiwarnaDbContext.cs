using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdiwarnaBackend.Data
{
    public class AdiwarnaDbContext(DbContextOptions<AdiwarnaDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Player> Players { get; set; }
        public DbSet<QrScan> QrScans { get; set; }
        public DbSet<LuckyDrawEntry> LuckyDrawEntries { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<TournamentTeam> TournamentTeams { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<PlayerGameStat> PlayerGameStats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AdiwarnaDbContext).Assembly);
        }
    }
}