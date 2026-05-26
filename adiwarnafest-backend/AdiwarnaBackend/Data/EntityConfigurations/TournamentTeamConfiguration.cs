using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class TournamentTeamConfiguration : IEntityTypeConfiguration<TournamentTeam>
    {
        public void Configure(EntityTypeBuilder<TournamentTeam> builder)
        {
            builder.HasKey(tt => new { tt.TournamentId, tt.TeamId });

            builder.HasOne(tt => tt.Team)
                .WithMany(team => team.TournamentTeams)
                .HasForeignKey(tt => tt.TeamId);
        }
    }
}