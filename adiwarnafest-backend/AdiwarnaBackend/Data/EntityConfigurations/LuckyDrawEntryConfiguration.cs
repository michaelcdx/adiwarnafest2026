using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class LuckyDrawEntryConfiguration : IEntityTypeConfiguration<LuckyDrawEntry>
    {
        public void Configure(EntityTypeBuilder<LuckyDrawEntry> builder)
        {
            builder.HasOne(entry => entry.User)
                .WithOne(user => user.LuckyDrawEntry)
                .HasForeignKey<LuckyDrawEntry>(entry => entry.UserId);
        }
    }
}