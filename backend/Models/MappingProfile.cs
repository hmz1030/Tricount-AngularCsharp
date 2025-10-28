using AutoMapper;
using System.Text.RegularExpressions;
using Tricount.Models.DTO;
using Tricount.Models.DTO.User;
using Tricount.Models.Entities;

namespace Tricount.Models;

/*
Cette classe sert à configurer AutoMapper pour lui indiquer quels sont les mappings possibles
et, le cas échéant, paramétrer ces mappings de manière déclarative (nous verrons des exemples plus tard).
*/
public class MappingProfile : Profile
{
    private readonly TricountContext _context;

    /*
    Le gestionnaire de dépendance injecte une instance du contexte EF dont le mapper peut
    se servir en cas de besoin (ce n'est pas encore le cas).
    */
    public MappingProfile(TricountContext context) {
        _context = context;

        CreateMap<SignupRequestDTO, User>()
            .ForMember(d => d.Email, o => o.MapFrom(s => (s.Email ?? "").Trim()))
            .ForMember(d => d.Name, o => o.MapFrom(s => (s.Name ?? "").Trim()))
            .ForMember(d => d.Iban, o => o.MapFrom(s =>
                string.IsNullOrWhiteSpace(s.Iban)
                    ? null
                    : Regex.Replace(s.Iban, @"\s+", " ").Trim().ToUpperInvariant()))
            .ForMember(d => d.Role, o => o.MapFrom(_ => Role.User))
            .ForMember(d => d.Password, o => o.Ignore());
    }
}