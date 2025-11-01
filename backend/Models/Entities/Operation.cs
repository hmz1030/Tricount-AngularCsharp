using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tricount.Models.Entities;

public class Operation {
    
    [Key]
    public int Id { get; set; }

    public string Title { get; set; } = null!;
    
    public int TricountId { get; set; }
    public TricountEntity Tricount { get; set; } = null!;

    public decimal Amount { get; set; }

     //Date ou la depense à été faite
    public DateOnly OperationDate { get; set; }
    
    public int InitiatorId  { get; set; }
    public User Initiator { get; set; } = null!;
    
   
    //Date/heure d'insertion
    public DateTime CreatedAt { get; set; }
    
    

}