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
    public static int _nextId = 1;
    [Key]
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public Role Role { get; set; }
    public string? Iban { get; set; }

    public User(string name, string email, string password, string? iban = null) {
        Id = _nextId++;
        Name = name;
        Email = email;
        Password = password;
        Role = Role.User;
        Iban = iban;
    }
    
    public User() { }
    
}