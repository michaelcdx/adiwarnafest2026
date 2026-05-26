using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasIndex(user => user.Email)
                .IsUnique()
                .HasDatabaseName("IX_Users_Email");

            builder.HasMany(user => user.RefreshTokens)
                .WithOne(token => token.User)
                .HasForeignKey(token => token.UserId);

            builder.HasMany(user => user.QrScans)
                .WithOne(scan => scan.User)
                .HasForeignKey(scan => scan.UserId);

            builder.HasOne(user => user.LuckyDrawEntry)
                .WithOne(entry => entry.User)
                .HasForeignKey<LuckyDrawEntry>(entry => entry.UserId);
        }
    }
}