using System.Text.Json.Serialization;
using Tricount.Models.DTO.Repartition;
using Tricount.Models.Entities;

public class OperationSaveDTO
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    
    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;
    
    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }
    
    [JsonPropertyName("operation_date")]
    public DateOnly OperationDate { get; set; }
    
    [JsonPropertyName("tricount_id")]
    public int TricountId { get; set; }
    
    [JsonPropertyName("initiator")]
    public int Initiator { get; set; }
    
    [JsonPropertyName("repartitions")]
    public List<RepartitionDTO> Repartitions { get; set; } = new List<RepartitionDTO>();
}