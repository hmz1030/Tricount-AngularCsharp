using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Tricount.Models.Entities;

namespace Tricount.Models.Validators;

public class TricountValidator : AbstractValidator<TricountEntity>
{
    private readonly TricountContext _context;

    public TricountValidator(TricountContext context)
    {
        _context = context;

        //  Titre obligatoire avec minimum 3 caractères
        //  quand ya pas Ruleset("create") par exemple, et bien cest une regle par defaut, s'applique a tous !
        RuleFor(t => t.Title)
            .NotEmpty()
            .WithMessage("Le titre est obligatoire.")
            .MinimumLength(3)
            .WithMessage("Le titre doit contenir au minimum 3 caractères.");

        // Titre unique pour un créateur donné
        // S'applique pour CREATE et UPDATE (default)
        RuleFor(t => t)
            .MustAsync(async (tricount, token) => await BeUniqueTitleForCreator(tricount, token))
            .WithMessage(t => $"Le titre '{t.Title}' existe déjà pour ce créateur.")
            .OverridePropertyName(nameof(TricountEntity.Title));

        // Description optionnelle, mais si fournie doit avoir min 3 caractères
        // S'applique pour CREATE et UPDATE (default)
        RuleFor(t => t.Description)
            .MinimumLength(3)
            .When(t => !string.IsNullOrWhiteSpace(t.Description))
            .WithMessage("La description doit contenir au minimum 3 caractères si elle est fournie.");

        // CreatorId obligatoire et doit exister
        
        RuleFor(t => t.CreatorId)
            .NotEmpty()
            .WithMessage("Le créateur est obligatoire.")
            .MustAsync(async (creatorId, token) => await CreatorExists(creatorId, token))
            .WithMessage("Le créateur spécifié n'existe pas.");

        // Règle métier : Le créateur ne peut pas être modifié
        //juste  pour l'update ça
        RuleSet("update", () =>
        {
            RuleFor(t => t.CreatorId)
                .MustAsync(async (tricount, creatorId, token) => await CreatorNotChanged(tricount, creatorId, token))
                .WithMessage("Le créateur ne peut pas être modifié.");
        });
    }

    //methode privé pour verif si le titre unique pour le owner
    private async Task<bool> BeUniqueTitleForCreator(TricountEntity tricount, CancellationToken token)
    {
        return !await _context.Tricounts.AnyAsync(
            t => t.Title == tricount.Title 
                 && t.CreatorId == tricount.CreatorId 
                 && t.Id != tricount.Id, // Exclure le tricount lui-même en cas de modification
            token
        );
    }

    // pour verif si le createur existe réellement
    private async Task<bool> CreatorExists(int creatorId, CancellationToken token)
    {
        return await _context.Users.AnyAsync(u => u.Id == creatorId, token);
    }

   
    
    /// Vérifie que le créateur n'a pas été modifié
    private async Task<bool> CreatorNotChanged(TricountEntity tricount, int newCreatorId, CancellationToken token)
    {
        var original = await _context.Tricounts
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == tricount.Id, token);

        if (original == null)
            return true; // Nouveau tricount, pas de vérification

        return original.CreatorId == newCreatorId;
    }

    
    /// Validation spécifique pour la création
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(TricountEntity tricount)
    {
        return await this.ValidateAsync(tricount, o => o.IncludeRuleSets("default", "create"));
    }

    /// Validation spécifique pour la modification
    
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnUpdate(TricountEntity tricount)
    {
        return await this.ValidateAsync(tricount, o => o.IncludeRuleSets("default", "update"));
    }
}
