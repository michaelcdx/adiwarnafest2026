using AdiwarnaBackend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AdiwarnaBackend.Data.EntityConfigurations
{
    public class QrScanConfiguration : IEntityTypeConfiguration<QrScan>
    {
        public void Configure(EntityTypeBuilder<QrScan> builder)
        {
            builder.HasOne(scan => scan.User)
                .WithMany(user => user.QrScans)
                .HasForeignKey(scan => scan.UserId);
        }
    }
}