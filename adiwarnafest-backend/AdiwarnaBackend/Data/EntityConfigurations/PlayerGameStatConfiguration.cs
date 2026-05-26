using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class PlayerGameStatConfiguration : IEntityTypeConfiguration<PlayerGameStat>
    {
        public void Configure(EntityTypeBuilder<PlayerGameStat> builder)
        {
            builder.HasKey(pgs => new { pgs.GameId, pgs.PlayerId });

            builder.HasOne(pgs => pgs.Game)
                .WithMany(game => game.PlayerGameStats)
                .HasForeignKey(pgs => pgs.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(pgs => pgs.Player)
                .WithMany(player => player.PlayerGameStats)
                .HasForeignKey(pgs => pgs.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}