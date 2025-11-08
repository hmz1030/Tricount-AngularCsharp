using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tricount.Helpers;
using Tricount.Models.Entities;

namespace Tricount.Models.Configurations;

public class AdministratorConfiguration : IEntityTypeConfiguration<Administrator>
{
    public void Configure(EntityTypeBuilder<Administrator> e) 
    {
        e.HasData(new Administrator { Id = 9, Name = "Admin", Email = "admin@epfc.eu", Password = TokenHelper.GetPasswordHash("Password1,") });

    }
}