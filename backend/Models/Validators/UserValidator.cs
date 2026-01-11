using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.RegularExpressions;
using Tricount.Helpers;
using Tricount.Models.Entities;

namespace Tricount.Models.Validators;

public class UserValidator : AbstractValidator<User>
{
    private readonly TricountContext _context;
    public static readonly Regex StrongPwdRx =
        new(@"^(?=.*\d)(?=.*[A-Z])(?=.*\W).{8,}$", RegexOptions.Compiled);

    public static readonly Regex EmailFormat =
        new(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", RegexOptions.Compiled);

    public static readonly Regex IbanFormat =
        new(@"^[A-Z]{2}\d{2}(?:\s\d{4}){3}$", RegexOptions.Compiled);

    public UserValidator(TricountContext context) {
        _context = context;

        RuleFor(u => u.Password)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(StrongPwdRx.IsMatch)
            .WithMessage("Password must be at least 8 characters long and contain at least one digit, one uppercase letter, one lowercase letter and one special character");

        RuleFor(u => u.Name)
            .NotEmpty()
            .MinimumLength(3)
            .WithMessage("Min length is 3 char");

        RuleFor(m => m.Name)
            .MustAsync(BeUniquePseudo)
            .OverridePropertyName(nameof(User.Name))
            .WithMessage("User '{PropertyValue}' already exists");

        RuleFor(u => u.Email)
            .MustAsync(BeUniqueEmail)
            .OverridePropertyName(nameof(User.Email))
            .WithMessage("User '{PropertyValue}' already exists");

        RuleFor(u => u.Email)
            .NotEmpty()
            .Must(EmailFormat.IsMatch)
            .WithMessage("Invalid email format (expected xxx@xxx.xx).");

        RuleFor(u => u.Iban)
            .Must(i => string.IsNullOrWhiteSpace(i) || IbanFormat.IsMatch(i))
            .WithMessage("IBAN must match format: AA99 9999 9999 9999.");

        RuleSet("login", () => {
            RuleFor(m => m.Token)
                .NotNull().OverridePropertyName("Password").WithMessage("Incorrect password");
        });

        RuleFor(u => u.Role)
            .IsInEnum();


    }
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(User member) {
        return await this.ValidateAsync(member, o => o.IncludeRuleSets("default", "create"));
    }

    private async Task<bool> BeUniquePseudo(string pseudo, CancellationToken token) {
        return !await _context.Users.AnyAsync(m => m.Name == pseudo, token);
    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken token) {
        return !await _context.Users.AnyAsync(u => u.Email == email, token);
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateForLogin(User? user) {
        if (user == null) {
            return ValidatorHelper.CustomError("Member not found.", "Pseudo");
        }
        return await this.ValidateAsync(user!, o => o.IncludeRuleSets("login"));
    }
}