using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Metadata;


namespace Tricount.Models.Configurations;

public class RepartitionConfiguration : IEntityTypeConfiguration<Repartition> {

    public void Configure(EntityTypeBuilder<Repartition> r) {
        r.HasKey(r => new { r.OperationId, r.UserId });

        // Relations
        r.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        r.HasOne(r => r.Operation)
            .WithMany(r => r.Repartitions)
            .HasForeignKey(r => r.OperationId)
            .OnDelete(DeleteBehavior.Restrict);

        r.ToTable(t => {
            t.HasCheckConstraint("CK_Repartitions_Weight_Positive", "\"Weight\" > 0");
        });
            
        // ----- Seed -----
        r.HasData(
            // operation;user;weight
            new Repartition { OperationId = 1, UserId = 1, Weight = 1 },
            new Repartition { OperationId = 1, UserId = 2, Weight = 1 },
            new Repartition { OperationId = 2, UserId = 1, Weight = 1 },
            new Repartition { OperationId = 2, UserId = 2, Weight = 1 },
            new Repartition { OperationId = 3, UserId = 1, Weight = 2 },
            new Repartition { OperationId = 3, UserId = 2, Weight = 1 },
            new Repartition { OperationId = 3, UserId = 3, Weight = 1 },
            new Repartition { OperationId = 4, UserId = 1, Weight = 1 },
            new Repartition { OperationId = 4, UserId = 2, Weight = 2 },
            new Repartition { OperationId = 4, UserId = 3, Weight = 3 },
            new Repartition { OperationId = 5, UserId = 1, Weight = 2 },
            new Repartition { OperationId = 5, UserId = 2, Weight = 1 },
            new Repartition { OperationId = 5, UserId = 3, Weight = 1 },
            new Repartition { OperationId = 6, UserId = 1, Weight = 1 },
            new Repartition { OperationId = 6, UserId = 3, Weight = 1 }
        );
    }
}