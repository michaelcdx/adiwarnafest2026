using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class LiveYoutubeConfiguration : IEntityTypeConfiguration<LiveYoutube>
    {
        public void Configure(EntityTypeBuilder<LiveYoutube> builder)
        {
            builder.Property(ly => ly.Title)
                .IsRequired();

            builder.Property(ly => ly.FilePath)
                .IsRequired();

            builder.Property(ly => ly.Status)
                .IsRequired();

            builder.HasQueryFilter(ly => !ly.IsDeleted);
        }
    }
}
