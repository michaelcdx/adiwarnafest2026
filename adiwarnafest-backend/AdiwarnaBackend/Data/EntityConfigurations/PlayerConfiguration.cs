using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class PlayerConfiguration : IEntityTypeConfiguration<Player>
    {
        public void Configure(EntityTypeBuilder<Player> builder)
        {
            builder.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Players_PlayerNumber", "\"PlayerNumber\" >= 0 AND \"PlayerNumber\" <= 99");
                t.HasCheckConstraint("CK_Players_Goals", "\"Goals\" >= 0");
                t.HasCheckConstraint("CK_Players_Foul1", "\"Foul1\" >= 0");
                t.HasCheckConstraint("CK_Players_Foul2", "\"Foul2\" >= 0");
            });

            builder.HasIndex(player => new { player.TeamId, player.PlayerNumber })
                .IsUnique();

            builder.HasOne(player => player.Team)
                .WithMany(team => team.Players)
                .HasForeignKey(player => player.TeamId);
        }
    }
}