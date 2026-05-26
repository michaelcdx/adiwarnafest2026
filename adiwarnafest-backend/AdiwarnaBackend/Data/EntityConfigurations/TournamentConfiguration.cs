using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class TournamentConfiguration : IEntityTypeConfiguration<Tournament>
    {
        public void Configure(EntityTypeBuilder<Tournament> builder)
        {
            builder.Property(t => t.GameType)
                .IsRequired();

            builder.HasQueryFilter(tournament => !tournament.IsDeleted);

            builder.HasMany(tournament => tournament.TournamentTeams)
                .WithOne(tt => tt.Tournament)
                .HasForeignKey(tt => tt.TournamentId);

            builder.HasMany(tournament => tournament.Games)
                .WithOne(game => game.Tournament)
                .HasForeignKey(game => game.TournamentId);
        }
    }
}