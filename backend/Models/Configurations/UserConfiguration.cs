using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Tricount.Models.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> e) 
    {

        e.Property(u => u.Id).UseIdentityByDefaultColumn();

        e.HasDiscriminator(u => u.Role)
            .HasValue<User>(Role.User)
            .HasValue<Administrator>(Role.Admin);
        
        // *****Contraintes du cahier de charges*****

        //Email et Name insensibles à la casse
        e.Property(u => u.Email).HasColumnType("citext").IsRequired();
        e.Property(u => u.Name).HasColumnType("citext").IsRequired();

        //Contraintes d'unicité
        e.HasIndex(u => u.Email).IsUnique();
        e.HasIndex(u => u.Name).IsUnique();

        e.ToTable(t =>
        {
            t.HasCheckConstraint("CK_Users_Iban_Format", "\"Iban\" IS NULL OR \"Iban\" ~ '^[A-Z]{2}\\d{2}(\\s\\d{4}){3}$'");
            t.HasCheckConstraint("CK_Users_Name_Trim",  "\"Name\"  = btrim(\"Name\")");
            t.HasCheckConstraint("CK_Users_Email_Trim", "\"Email\" = btrim(\"Email\")");
            t.HasCheckConstraint("CK_User_Name_Length","length(\"Name\") >= 3");
        });

        
        //Données de seed
        e.HasData(
            new User { Id = 1, Name = "Boris", Email = "boverhaegen@epfc.eu", Password = "Password1," },
            new User { Id = 2, Name = "Benoît", Email = "bepenelle@epfc.eu", Password = "Password1," },
            new User { Id = 3, Name = "Xavier", Email = "xapigeolet@epfc.eu", Password = "Password1," },
            new User { Id = 4, Name = "Marc", Email = "mamichel@epfc.eu", Iban = "BE12 1234 1234 1234", Password = "Password1," },
            new User { Id = 5, Name = "Geoffrey", Email = "gedielman@epfc.eu", Iban = "BE45 4567 4567 4567",  Password = "Password1," }
        );

    }
}