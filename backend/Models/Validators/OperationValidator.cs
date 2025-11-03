using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Tricount.Models;
using Tricount.Models.Entities;

public class OperationValidator : AbstractValidator<Operation>
{
    private readonly TricountContext _context;

    public OperationValidator(TricountContext context) {
        _context = context;

        RuleFor(o => o.Title)
            .NotEmpty()
            .MinimumLength(3)
            .WithMessage("Le titre doit contenir au moins 3 caractères.");

        RuleFor(o => o.Amount)
            .GreaterThanOrEqualTo(0.01m)
            .WithMessage("Le montant doit être au moins 0.01€.");

        RuleFor(o => o.OperationDate)
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now))
            .WithMessage("La date d'opération ne peut pas être dans le futur.");

        // Validation métier : l'initiateur doit être participant du tricount
        RuleFor(o => o)
            .MustAsync(async (operation, token) => await InitiatorIsParticipant(operation, token))
            .WithMessage("L'initiateur doit être un participant du tricount.");
    }

    private async Task<bool> InitiatorIsParticipant(Operation operation, CancellationToken token) {
        return await _context.Participations
            .AnyAsync(p => p.TricountId == operation.TricountId && p.UserId == operation.InitiatorId, token);
    }
}