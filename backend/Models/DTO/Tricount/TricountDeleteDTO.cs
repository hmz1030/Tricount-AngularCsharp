
using System.Text.Json.Serialization;

namespace Tricount.Models.DTO.Tricount;

public class TricountDeleteDTO
{
    [JsonPropertyName("tricount_id")]
    public int Id { get; set; }
}
