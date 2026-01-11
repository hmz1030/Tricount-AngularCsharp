using System.Text.Json.Serialization;
using Tricount.Models.DTO.User;
using Tricount.Models.Entities;

namespace Tricount.Models.DTO.Tricount;


public class TricountSaveDTO
{
    // si zero = creation; si sup c'est une modif
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    // IDs des participants (si yen a, hors creator)
    [JsonPropertyName("participants")]
    public List<int> Participants { get; set; } = new List<int>()!;
}
