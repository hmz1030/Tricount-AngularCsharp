using System.Text.Json.Serialization;

public class LoginRequestDTO
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;

    [JsonPropertyName("password")]
    public string Password { get; set; } = null!;
}


public class LoginResponseDTO
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = null!;
}