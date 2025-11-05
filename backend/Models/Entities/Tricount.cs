using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Tricount.Models.Entities;
public class TricountEntity{
    [Key]
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int CreatorId { get; set; }
    public User Creator { get; set; } = null!;
    public ICollection<User> Participants { get; set; } = new HashSet<User>();
    public DateTime CreatedAt { get; set; } 
    public ICollection<Operation> Operations { get; set; } = new List<Operation>();

}