using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tricount.Models.Entities;

namespace Tricount.Models.Configurations;

public class ParticipationConfiguration : IEntityTypeConfiguration<Participation>
{
    public void Configure(EntityTypeBuilder<Participation> e)
    {
        // Clé primaire composite (TricountId + UserId)
        e.HasKey(p => new { p.TricountId, p.UserId });

        // Relation avec Tricount (many to many)
        e.HasOne(p => p.Tricount)
            .WithMany(t => t.Participants)
            .HasForeignKey(p => p.TricountId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relation avec User (many to many )
        e.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Données de seed (depuis participations.csv)
        e.HasData(
            new Participation { TricountId = 1, UserId = 1 },
            new Participation { TricountId = 2, UserId = 1 },
            new Participation { TricountId = 4, UserId = 1 },
            new Participation { TricountId = 2, UserId = 2 },
            new Participation { TricountId = 4, UserId = 2 },
            new Participation { TricountId = 4, UserId = 3 },
            new Participation { TricountId = 4, UserId = 4 }
        );
    }
}
