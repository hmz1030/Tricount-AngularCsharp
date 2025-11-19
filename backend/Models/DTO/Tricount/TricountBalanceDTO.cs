using System.Text.Json.Serialization;

namespace Tricount.Models.DTO.Tricount;

public class TricountBalanceDTO
{
    [JsonPropertyName("user")]
    public int User { get; set; }
    
    [JsonPropertyName("paid")]
    public decimal Paid { get; set; }
    
    [JsonPropertyName("due")]
    public decimal Due { get; set; }
    
    [JsonPropertyName("balance")]
    public decimal Balance { get; set; }
}
