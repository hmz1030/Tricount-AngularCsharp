using System.Text.Json.Serialization;
using Tricount.Models.DTO.User;

namespace Tricount.Models.DTO.Tricount;


/// DTO pour get un tricount ( le lire)

public class TricountTitleCheckDTO
{
    
    [JsonPropertyName("tricount_id")]
    public int Id { get; set;}

    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;
}
