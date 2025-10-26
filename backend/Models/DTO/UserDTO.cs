using System.Text.Json.Serialization;
namespace Tricount.Models.DTO;

public class UserDTO
{
   [JsonPropertyName("full_name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;

    [JsonPropertyName("password")]
    public string Password { get; set; } = null!;

    [JsonPropertyName("iban")]
    public string? Iban { get; set; }
}