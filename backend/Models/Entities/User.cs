using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Tricount.Models.Entities;

//TODO: à compléter/modifier

public enum Role
{
    Admin = 1,
    User = 0
}
    

public class User
{
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public Role Role { get; set; } = Role.User;
    public string? Iban { get; set; }

    public ICollection<TricountEntity> Tricounts { get; set; } = new List<TricountEntity>();
    
    
}