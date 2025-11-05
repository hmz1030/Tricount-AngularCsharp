using System.Text.Json.Serialization;
using Tricount.Models.DTO.Repartition;
using Tricount.Models.Entities;

public class OperationDTO
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    
    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;
    
    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }
    
    [JsonPropertyName("operation_date")]
    public DateOnly OperationDate { get; set; }
    
    [JsonPropertyName("initiator")]
    public int InitiatorId { get; set; }
    
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [JsonPropertyName("repartitions")]
    public ICollection<RepartitionDTO> Repartitions { get; set; } = new List<RepartitionDTO>();
}