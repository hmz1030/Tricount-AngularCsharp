using System.Text.Json.Serialization;

namespace Tricount.Models.DTO.User;


/// DTO pour get un User data

public class UserNameCheckDTO
{
    [JsonPropertyName("user_id")]
    public int Id { get; set; }

    [JsonPropertyName("full_name")]
    public string FullName { get; set; } = null!;
}
