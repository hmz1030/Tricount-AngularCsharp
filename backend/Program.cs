using AutoMapper;
using AutoMapper.EquivalencyExpression;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Tricount.Models;
using Tricount.Models.Validators;

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
builder.Services.AddValidatorsFromAssemblyContaining<UserValidator>();

// Auto Mapper Configurations
builder.Services.AddScoped(provider => new MapperConfiguration(cfg => {
    cfg.AddProfile(new MappingProfile(provider.GetService<TricountContext>()!));
    // see: https://github.com/AutoMapper/AutoMapper.Collection
    cfg.AddCollectionMappers();
}).CreateMapper());

//------------------------------ 
// configure jwt authentication 
//------------------------------ 

// Notre clé secrète pour les jetons sur le back-end 
var key = Encoding.ASCII.GetBytes("my-super-secret-key my-super-secret-key");
// On précise qu'on veut travaille avec JWT tant pour l'authentification  
// que pour la vérification de l'authentification 
builder.Services.AddAuthentication(x => {
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(x => {
        // On exige des requêtes sécurisées avec HTTPS 
        x.RequireHttpsMetadata = true;
        x.SaveToken = true;
        // On précise comment un jeton reçu doit être validé 
        x.TokenValidationParameters = new TokenValidationParameters {
            // On vérifie qu'il a bien été signé avec la clé définie ci-dessous 
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            // On ne vérifie pas l'identité de l'émetteur du jeton 
            ValidateIssuer = false,
            // On ne vérifie pas non plus l'identité du destinataire du jeton 
            ValidateAudience = false,
            // Par contre, on vérifie la validité temporelle du jeton 
            ValidateLifetime = true,
            // On précise qu'on n'applique aucune tolérance de validité temporelle 
            ClockSkew = TimeSpan.Zero  //the default for this setting is 5 minutes 
        };
        // On peut définir des événements liés à l'utilisation des jetons 
        x.Events = new JwtBearerEvents {
            // Si l'authentification du jeton est rejetée ... 
            OnAuthenticationFailed = context => {
                // ... parce que le jeton est expiré ... 
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException)) {
                    // ... on ajoute un header à destination du frontend indiquant cette expiration 
                    context.Response.Headers.Append("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });

// Ajouter CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Activer CORS
app.UseCors("AllowFrontend");

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