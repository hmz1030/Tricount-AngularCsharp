using System.Text.Json.Serialization;
using Tricount.Models.Entities;

namespace Tricount.Models.DTO.Tricount;

/// <summary>
/// DTO pour créer ou modifier un Tricount (save_tricount)
/// </summary>
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
    public HashSet<Participation> Participants { get; set; } = new HashSet<Participation>()!;
}
