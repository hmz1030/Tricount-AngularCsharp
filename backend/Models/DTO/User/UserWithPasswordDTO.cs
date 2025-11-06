namespace Tricount.Models.DTO.User;

public class UserWithPasswordDTO : UserLoginDTO
{
    public string Password { get; set; } = "";
}