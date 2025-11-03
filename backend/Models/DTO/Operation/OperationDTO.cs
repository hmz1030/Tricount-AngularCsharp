using Tricount.Models.Entities;

public class OperationDTO
{
    public int ID { get; set; }
    public string Title { get; set; }
    public decimal Amount { get; set; }
    public DateOnly OperationDate { get; set; }
    public int InitiatorId { get; set; }
     public DateTime CreatedAt { get; set; }
     //public ICollection<RepartitionDTO> Repartitions { get; set; } = new List<Repartition>();
}