using System.Text.Json.Serialization;
using Tricount.Models.Entities;

namespace Tricount.Models.DTO.Repartition;

public class RepartitionDTO
{
    [JsonPropertyName("user")]
    public int UserId { get; set; }
    
    [JsonPropertyName("weight")]
    public int Weight { get; set; }
}