using Tricount.Models.Entities;

namespace Tricount.Models.DTO.User;

public class UserLoginDTO
{
    public string Email { get; set; } = null!;
    public string? Token { get; set; }
}