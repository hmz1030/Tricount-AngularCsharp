using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tricount.Models.Entities;

public class Repartition {
    
    public int OperationId { get; set; }
    public Operation Operation { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int Weight { get; set; }
}