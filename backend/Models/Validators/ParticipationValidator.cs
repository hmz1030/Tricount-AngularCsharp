using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;

namespace Tricount.Models.Validators;

public class ParticipationValidator : AbstractValidator<Participation>
{
    private readonly TricountContext _context;

    public ParticipationValidator(TricountContext context)
    {
        _context = context;

        // Le tricount doit exister
        RuleFor(p => p.TricountId)
            .MustAsync(async (tricountId, token) => await TricountExists(tricountId, token))
            .WithMessage("Le tricount spécifié n'existe pas.");

        // L'utilisateur doit exister
        RuleFor(p => p.UserId)
            .MustAsync(async (userId, token) => await UserExists(userId, token))
            .WithMessage("L'utilisateur spécifié n'existe pas.");

        //Le créateur ne peut PAS être retiré des participants
        RuleSet("delete", () =>
        {
            RuleFor(p => p)
                .MustAsync(async (participation, token) => await IsNotCreator(participation, token))
                .WithMessage("Le créateur du tricount ne peut pas être retiré des participants.");
        });

        // TODO quand on aura fais le model operation =>
        // Un participant impliqué dans une dépense ne peut aps être supprimé
    }

    // Vérifie que le tricount existe
    private async Task<bool> TricountExists(int tricountId, CancellationToken token)
    {
        return await _context.Tricounts.AnyAsync(t => t.Id == tricountId, token);
    }

    // Vérifie que l'utilisateur existe
    private async Task<bool> UserExists(int userId, CancellationToken token)
    {
        return await _context.Users.AnyAsync(u => u.Id == userId, token);
    }

    // Vérifie que l'utilisateur n'est pas le créateur du tricount
    private async Task<bool> IsNotCreator(Participation participation, CancellationToken token)
    {
        var tricount = await _context.Tricounts
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == participation.TricountId, token);

        if (tricount == null) return true;

        // Retourne false si c'est le créateur (erreur de validation)
        return tricount.CreatorId != participation.UserId;
    }

    // Validation pour la suppression
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnDelete(Participation participation)
    {
        return await this.ValidateAsync(participation, o => o.IncludeRuleSets("default", "delete"));
    }
}
