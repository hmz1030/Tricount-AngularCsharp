using Tricount.Models.Entities;

public class OperationSaveDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateOnly OperationDate { get; set; }
    public int Tricount_id { get; set; }
    public int Initiator { get; set; }
     //public ICollection<RepartitionDTO> Repartitions { get; set; } = new List<Repartition>();
}