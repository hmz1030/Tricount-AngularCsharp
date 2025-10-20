using AutoMapper;
using AutoMapper.EquivalencyExpression;
using Microsoft.EntityFrameworkCore;
using Tricount.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// In production, the Angular files will be served from this directory (see: https://stackoverflow.com/a/55989907)
builder.Services.AddSpaStaticFiles(cfg => cfg.RootPath = "wwwroot/frontend");

builder.Services.AddDbContext<TricountContext>(opt => opt.UseNpgsql(
    builder.Configuration.GetConnectionString("prid-2526-a06")
));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Auto Mapper Configurations
builder.Services.AddScoped(provider => new MapperConfiguration(cfg => {
    cfg.AddProfile(new MappingProfile(provider.GetService<TricountContext>()!));
    // see: https://github.com/AutoMapper/AutoMapper.Collection
    cfg.AddCollectionMappers();
}).CreateMapper());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Seed the database
using var scope = app.Services.CreateScope();
using var context = scope.ServiceProvider.GetService<TricountContext>();
if (app.Environment.IsDevelopment()) {
    context?.Database.EnsureDeleted();
}

context?.Database.EnsureCreated();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseSpaStaticFiles();

app.UseAuthorization();

app.MapControllers();

app.UseSpa(spa => {});

app.Run();