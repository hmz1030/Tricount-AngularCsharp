using AutoMapper;
using System.Text.RegularExpressions;
using Tricount.Models.DTO;
using Tricount.Models.DTO.User;
using Tricount.Models.Entities;
using Tricount.Models.DTO.Tricount;
using Tricount.Models.DTO.Repartition;

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

        // Mapping User → UserDTO (pour les participants)
        CreateMap<User, UserDTO>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.Name))
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role == Role.Admin ? "admin" : "basic_user"));

        // Mapping TricountEntity → TricountDTO (pour la response)
        CreateMap<TricountEntity, TricountDTO>()
            .ForMember(d => d.Creator, o => o.MapFrom(s => s.CreatorId))
            .ForMember(d => d.Participants, o => o.MapFrom(s => s.Participants))
            .ForMember(d => d.Operations, o => o.Ignore());

        CreateMap<Operation, OperationDTO>()
            .ForMember(d => d.Title, o => o.MapFrom(s => (s.Title ?? "").Trim()))
            .ForMember(d => d.Repartitions, o => o.MapFrom(
                s => s.Repartitions.OrderBy(r => r.UserId)
            ));

        CreateMap<OperationSaveDTO, Operation>();
            
        
        CreateMap<Repartition, RepartitionDTO>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.UserId));

        CreateMap<RepartitionDTO, Repartition>()
            .ForMember(d => d.UserId, o => o.MapFrom(s => s.UserId));
        

        // Mapping User → UserLoginDTO (pour la response après login)
        //CreateMap<User, UserLoginDTO>();
        //CreateMap<UserLoginDTO, User>();
        //CreateMap<User, LoginTokenDTO>();
        //CreateMap<LoginTokenDTO, User>();
        
        CreateMap<TricountEntity, TricountDetailsDTO>()
            .ForMember(d => d.Creator,   o => o.MapFrom(s => s.CreatorId))
            .ForMember(d => d.CreatedAt, o => o.MapFrom(s => s.CreatedAt))
            .ForMember(d => d.Participants, o => o.MapFrom(
                s => s.Participants.OrderBy(p => p.Email)
            ))
            .ForMember(d => d.Operations, o => o.MapFrom(
                s => s.Operations.OrderByDescending(op => op.CreatedAt)
            ));

    
    }
}