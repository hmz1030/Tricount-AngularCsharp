using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;

namespace Tricount.Models;

public class TricountContext(DbContextOptions<TricountContext> options) : DbContext(options)
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder
            .LogTo(Console.WriteLine, LogLevel.Information)
            .EnableSensitiveDataLogging();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        _ = modelBuilder.Entity<User>()
            .HasData(
                new User { Name = "User 1", Email = "user1@gmail.com", Password = "password" },
                new User { Name = "User 2", Email = "user2@gmail.com", Password = "password" },
                new User { Name = "User 3", Email = "user3@gmail.com", Password = "password" },
                new User { Name = "Admin", Email = "admin@gmail.com", Password = "adminpassword" }
            );

        // l'entité user...
        modelBuilder.Entity<User>()
            // doit utiliser la propriété role comme discriminateur...
            .HasDiscriminator(u => u.Role)
            // en mappant la valeur Role.User sur le type User...
            .HasValue<User>(Role.User)
            // en en mappant la valeur Role.Administrator sur le type Administrator...
            .HasValue<Administrator>(Role.Admin);
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Administrator> Administrators => Set<Administrator>();
}