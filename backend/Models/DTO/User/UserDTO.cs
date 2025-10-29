using System.Text.Json.Serialization;

namespace Tricount.Models.DTO.User;


/// DTO pour get un User data

public class UserDTO
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = null!;

    [JsonPropertyName("iban")]
    public string? Iban { get; set; }

    [JsonPropertyName("role")]
    public string Role { get; set; } = null!;
}
