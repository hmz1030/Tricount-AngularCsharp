using System.ComponentModel.DataAnnotations;

namespace Tricount.Models.Entities;



// Many-to-Many entre User et Tricount

public class Participation
{
    // Clé composite : TricountId + UserId, pas oublier le model tricount s'apl TricountEntity
    public int TricountId { get; set; }
    public TricountEntity Tricount { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}