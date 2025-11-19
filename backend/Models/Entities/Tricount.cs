using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Tricount.Models.DTO.Tricount;

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

   
    public static async Task<TricountEntity?> GetByIdWithDetails(TricountContext context, int id) {
        return await context.Tricounts
            .Include(t => t.Participants)
            .Include(t => t.Operations)
                .ThenInclude(o => o.Repartitions)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    // Calcul ddla balance
    public List<TricountBalanceDTO> CalculateBalance() {
        // dictionnary, tableau associatif, key = id user et value la balance du user, comme ca
        // on accede plus facilement
        var balances = new Dictionary<int, TricountBalanceDTO>();
        
        // faut init la balance a zero pour chacun 
        foreach (var participant in Participants) {
            balances[participant.Id] = new TricountBalanceDTO {
                User = participant.Id,
                Paid = 0,
                Due = 0,
                Balance = 0
            };
        }
        
        
        foreach (var operation in Operations) {
            if (balances.ContainsKey(operation.InitiatorId)) {
                balances[operation.InitiatorId].Paid += operation.Amount;
            }
            
            // Calcul de la somme des poids
            var totalWeight = operation.Repartitions.Sum(r => r.Weight);
            
            // calcul du due amount 
            foreach (var repartition in operation.Repartitions) {
                if (balances.ContainsKey(repartition.UserId)) {
                    var amountDue = (operation.Amount * repartition.Weight) / totalWeight;
                    balances[repartition.UserId].Due += amountDue;
                }
            }
        }
        
        foreach (var balance in balances.Values) {
            balance.Paid = Math.Round(balance.Paid, 2);
            balance.Due = Math.Round(balance.Due, 2);
            balance.Balance = Math.Round(balance.Paid - balance.Due, 2);
        }
        
        return balances.Values.OrderBy(b => b.User).ToList();
    }
}