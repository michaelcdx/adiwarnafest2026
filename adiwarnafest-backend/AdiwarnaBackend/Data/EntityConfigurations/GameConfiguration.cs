using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class GameConfiguration : IEntityTypeConfiguration<Game>
    {
        public void Configure(EntityTypeBuilder<Game> builder)
        {
            builder.HasQueryFilter(game => !game.IsDeleted);

            builder.HasOne(game => game.Tournament)
                .WithMany(tournament => tournament.Games)
                .HasForeignKey(game => game.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(game => game.Team1)
                .WithMany()
                .HasForeignKey(game => game.Team1Id)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(game => game.Team2)
                .WithMany()
                .HasForeignKey(game => game.Team2Id)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(g => new { g.TournamentId, g.Team1Id });
            builder.HasIndex(g => new { g.TournamentId, g.Team2Id });
        }
    }
}