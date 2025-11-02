using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Metadata;


namespace Tricount.Models.Configurations;



public class OperationConfiguration : IEntityTypeConfiguration<Operation>
{

    public void Configure(EntityTypeBuilder<Operation> o) {

        o.Property(o => o.Id).UseIdentityByDefaultColumn();

        o.Property(o => o.Title).IsRequired();
        o.Property(o => o.Amount).HasColumnType("numeric(12,2)");

        o.Property(o => o.CreatedAt)
            .HasColumnType("timestamp without time zone")
            .HasDefaultValueSql("CURRENT_TIMESTAMP")
            .ValueGeneratedOnAdd();
        o.Property(o => o.CreatedAt).Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Ignore);

        o.Property(o => o.OperationDate)
            .HasColumnType("date");

        // ------Relations--------
        o.HasOne(o => o.Initiator)
            .WithMany()
            .HasForeignKey(o => o.InitiatorId)
            .OnDelete(DeleteBehavior.Restrict);
        o.HasOne(o => o.Tricount)
            .WithMany(t => t.Operations)
            .HasForeignKey(o => o.TricountId)
            .OnDelete(DeleteBehavior.Restrict);

        o.ToTable(t => {
            t.HasCheckConstraint(
                "CK_Operations_Title_MinLen",
                "length(btrim(\"Title\")) >= 3"
            );

            t.HasCheckConstraint(
                "CK_Operations_Amount_Positive",
                "\"Amount\" >= 0.01"
            );

            t.HasCheckConstraint(
                 "CK_Operations_OperationDate_NotFuture",
                "\"OperationDate\" <= CURRENT_DATE"
            );
        });


        o.HasData(
        new Operation {
            Id = 1,
            Title = "Colruyt",
            TricountId = 4,
            Amount = 100.00m,
            OperationDate = new DateOnly(2024, 10, 13),
            InitiatorId = 2,
            CreatedAt = new DateTime(2024, 10, 13, 19, 09, 18)
        },
        new Operation {
            Id = 2,
            Title = "Plein essence",
            TricountId = 4,
            Amount = 75.00m,
            OperationDate = new DateOnly(2024, 10, 13),
            InitiatorId = 1,
            CreatedAt = new DateTime(2024, 10, 13, 20, 10, 41)
        },
        new Operation {
            Id = 3,
            Title = "Grosses courses LIDL",
            TricountId = 4,
            Amount = 212.47m,
            OperationDate = new DateOnly(2024, 10, 13),
            InitiatorId = 3,
            CreatedAt = new DateTime(2024, 10, 13, 21, 23, 49)
        },
        new Operation {
            Id = 4,
            Title = "Apéros",
            TricountId = 4,
            Amount = 31.90m, // arrondi à 2 décimales
            OperationDate = new DateOnly(2024, 10, 13),
            InitiatorId = 1,
            CreatedAt = new DateTime(2024, 10, 13, 23, 51, 20)
        },
        new Operation {
            Id = 5,
            Title = "Boucherie",
            TricountId = 4,
            Amount = 25.50m,
            OperationDate = new DateOnly(2024, 10, 26),
            InitiatorId = 2,
            CreatedAt = new DateTime(2024, 10, 26, 09, 59, 56)
        },
        new Operation {
            Id = 6,
            Title = "Loterie",
            TricountId = 4,
            Amount = 35.00m,
            OperationDate = new DateOnly(2024, 10, 26),
            InitiatorId = 1,
            CreatedAt = new DateTime(2024, 10, 26, 10, 02, 24)
        }
    );


    }

}