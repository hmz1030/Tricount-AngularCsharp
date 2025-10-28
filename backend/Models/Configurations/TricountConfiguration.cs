using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Tricount.Models.Configurations;

public class TricountConfiguration : IEntityTypeConfiguration<TricountEntity>
{
    public void Configure(EntityTypeBuilder<TricountEntity> e) 
    {
        // Identifiant unique auto-incrémenté
        e.Property(t => t.Id).UseIdentityByDefaultColumn();

        // Titre obligatoire
        e.Property(t => t.Title).IsRequired();
        
        // Description optionnelle
        e.Property(t => t.Description).IsRequired(false);

        // Date de création générée automatiquement et non modifiable
        e.Property(t => t.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .ValueGeneratedOnAdd();

        // CreatorId ne peut pas être modifié après création
        e.Property(t => t.CreatorId)
            .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Throw);

        // Relation avec User (Creator)
        e.HasOne(t => t.Creator)
            .WithMany()
            .HasForeignKey(t => t.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Index unique : un titre doit être unique pour un créateur donné
        e.HasIndex(t => new { t.Title, t.CreatorId }).IsUnique();

        // Contraintes de validation
        e.ToTable(t =>
        {
            // Le titre doit être trimé (pas d'espaces avant/après)
            t.HasCheckConstraint("CK_Tricount_Title_Trim", "\"Title\" = btrim(\"Title\")");
            
            // Le titre doit avoir au minimum 3 caractères
            t.HasCheckConstraint("CK_Tricount_Title_Length", "length(\"Title\") >= 3");
            
            // La description, si fournie, doit avoir au minimum 3 caractères
            t.HasCheckConstraint("CK_Tricount_Description_Length", 
                "\"Description\" IS NULL OR length(\"Description\") >= 3");
            
            // La description doit être trimée si elle est fournie
            t.HasCheckConstraint("CK_Tricount_Description_Trim", 
                "\"Description\" IS NULL OR \"Description\" = btrim(\"Description\")");
        });

        // Données de seed
        e.HasData(
            new TricountEntity 
            { 
                Id = 1, 
                Title = "Gers 2022", 
                Description = null,
                CreatorId = 1,
                CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 10, 10, 18, 42, 24), DateTimeKind.Utc)
            },
            new TricountEntity 
            { 
                Id = 2, 
                Title = "Resto badminton", 
                Description = null,
                CreatorId = 1,
                CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 10, 10, 19, 25, 10), DateTimeKind.Utc)
            },
            new TricountEntity 
            { 
                Id = 4, 
                Title = "Vacances", 
                Description = "A la mer du nord",
                CreatorId = 1,
                CreatedAt = DateTime.SpecifyKind(new DateTime(2024, 10, 10, 19, 31, 9), DateTimeKind.Utc)
            }
        );
    }
}
