using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;

namespace Tricount.Models.Validators;

public class RepartitionValidator : AbstractValidator<Repartition>
{
    private readonly TricountContext _context;

    public RepartitionValidator(TricountContext context)
    {
        _context = context;

        // Le poids doit être > 0
        RuleFor(r => r.Weight)
            .GreaterThan(0)
            .WithMessage("Le poids doit être supérieur à 0.");

        // L'opération doit exister
        RuleFor(r => r.OperationId)
            .MustAsync(async (operationId, token) => await OperationExists(operationId, token))
            .WithMessage("L'opération spécifiée n'existe pas.");

        // L'utilisateur doit exister
        RuleFor(r => r.UserId)
            .MustAsync(async (userId, token) => await UserExists(userId, token))
            .WithMessage("L'utilisateur spécifié n'existe pas.");

        // L'utilisateur doit être participant du tricount de l'opération
        RuleFor(r => r)
            .MustAsync(async (repartition, token) => await UserIsParticipant(repartition, token))
            .WithMessage("L'utilisateur doit être participant du tricount associé à cette opération.");
    }

    private async Task<bool> OperationExists(int operationId, CancellationToken token)
    {
        return await _context.Operations.AnyAsync(o => o.Id == operationId, token);
    }

    private async Task<bool> UserExists(int userId, CancellationToken token)
    {
        return await _context.Users.AnyAsync(u => u.Id == userId, token);
    }

    private async Task<bool> UserIsParticipant(Repartition repartition, CancellationToken token)
    {
        // Récupérer le tricount de l'opération
        var operation = await _context.Operations
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == repartition.OperationId, token);

        if (operation == null) return true;

        // Vérifier que l'user est participant de ce tricount
        return await _context.Participations
            .AnyAsync(p => p.TricountId == operation.TricountId && p.UserId == repartition.UserId, token);
    }
}