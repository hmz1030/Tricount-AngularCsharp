using System.Text.Json.Serialization;

namespace Tricount.Models.DTO.User;


/// DTO pour get un User data

public class UserMailCheckDTO
{
    [JsonPropertyName("user_id")]
    public int Id { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;
}
