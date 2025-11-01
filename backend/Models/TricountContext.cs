using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
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
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TricountContext).Assembly);
        modelBuilder.HasPostgresExtension("citext");
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Administrator> Administrators => Set<Administrator>();
    public DbSet<TricountEntity> Tricounts => Set<TricountEntity>();
    public DbSet<Operation> Operations => Set<Operation>();
    public DbSet<Repartition> Repartitions => Set<Repartition>();

}