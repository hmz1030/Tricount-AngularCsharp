using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Tricount.Models;
using Tricount.Models.Entities;
using Tricount.Models.Validators;

public class OperationValidator : AbstractValidator<Operation>
{
    private readonly TricountContext _context;

    public OperationValidator(TricountContext context) {
        _context = context;
        RuleFor(o => o.TricountId)
            .MustAsync(async (tricountId, token) => await _context.Tricounts.AnyAsync(t => t.Id == tricountId, token))
            .WithMessage("Tricount not found");

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

        RuleFor(o => o)
            .MustAsync(async (operation, token) => await OperationDateAfterTricountCreation(operation, token))
            .WithMessage("La date de l'opération précède la date de création du tricount");

        // Validation métier : l'initiateur doit être participant du tricount
        RuleFor(o => o)
            .MustAsync(async (operation, token) => await InitiatorIsParticipant(operation, token))
            .WithMessage("L'initiateur doit être un participant du tricount.");
        // au moins une répartition   
        RuleFor(o => o.Repartitions)
            .NotEmpty()
            .WithMessage("An operation must have at least one repartition");

        //pas de doublon dans repartitions 
        RuleFor(o => o.Repartitions)
            .Must(repartitions => repartitions.Select(r => r.UserId).Distinct().Count() == repartitions.Count)
            .WithMessage(" duplicate user in repartitions");

        //repartitions validator pour chaque repartition
        RuleForEach(o => o.Repartitions)
            .SetValidator(new RepartitionValidator(_context));  



        
    }

    private async Task<bool> OperationDateAfterTricountCreation(Operation operation, CancellationToken token) {
        var tricount = await _context.Tricounts.FindAsync(operation.TricountId);
        if (tricount == null) return true; // je met true comme ça je verif si tricount existe dans une autre rule;
        return operation.OperationDate >= DateOnly.FromDateTime(tricount.CreatedAt);
    }


    private async Task<bool> InitiatorIsParticipant(Operation operation, CancellationToken token) {
        return await _context.Participations
            .AnyAsync(p => p.TricountId == operation.TricountId && p.UserId == operation.InitiatorId, token);
    }
    /// Validation spécifique pour la création
    public async Task<FluentValidation.Results.ValidationResult> ValidateOperation(Operation operation) {
        return await this.ValidateAsync(operation, o => o.IncludeRuleSets("default"));
    }
    public static async Task<Operation?> GetByIdWithRepartitions(TricountContext context, int id) {
    return await context.Operations
        .Include(o => o.Repartitions)
        .FirstOrDefaultAsync(o => o.Id == id);
}
}