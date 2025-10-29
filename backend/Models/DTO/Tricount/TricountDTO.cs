using System.Text.Json.Serialization;
using Tricount.Models.DTO.User;

namespace Tricount.Models.DTO.Tricount;


/// DTO pour get un tricount ( le lire)

public class TricountDTO
{
    
    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    // ID du créateur
    [JsonPropertyName("creator")]
    public int Creator { get; set; }

    // Liste des participants 
    [JsonPropertyName("participants")]
    public List<UserDTO> Participants { get; set; } = new();

    // Liste des opérations (TODO : changer object par OperationDTO plus tard)
    //[JsonPropertyName("operations")]
    //public List<object> Operations { get; set; } = new();
}
