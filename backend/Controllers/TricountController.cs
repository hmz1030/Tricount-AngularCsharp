using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tricount.Helpers;
using Tricount.Models;
using Tricount.Models.DTO.Tricount;
using Tricount.Models.DTO.User;
using Tricount.Models.Entities;
using Tricount.Models.Validators;

namespace Tricount.Controllers;

[Route("rpc")]
[ApiController]
[Authorize]
public class TricountController(TricountContext context, IMapper mapper) : ControllerBase
{
    // GET: rpc/ping
    [AllowAnonymous]
    [HttpGet("ping")]
    public ActionResult<string> Ping() {
        return "\"Hello from project prid-2526-a06!\"";
    }

    // POST: rpc/reset_database
    [AllowAnonymous]
    [HttpPost("reset_database")]
    public async Task<ActionResult> ResetDatabase() {
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
        return NoContent();
    }

    //POST: rpc/signup
    [AllowAnonymous]
    [HttpPost("signup")]
    public async Task<ActionResult> Signup([FromBody] SignupRequestDTO dto, [FromServices] UserValidator validator) {
        var user = mapper.Map<User>(dto);
        user.Password = dto.Password;
        var vr = await validator.ValidateOnCreate(user);
        if (!vr.IsValid)
            return BadRequest(new {
                code = "P0001",
                details = (string?)null,
                hint = (string?)null,
                message = string.Join("; ", vr.Errors.Select(e => e.ErrorMessage))
            });

        user.Password = TokenHelper.GetPasswordHash(dto.Password);

        context.Users.Add(user);
        await context.SaveChangesAsync();

        return NoContent();
    }


    [AllowAnonymous]
    [HttpPost("save_tricount")]
    public async Task<bool> save_tricount(TricountSaveDTO tricount) {
        TricountEntity tricountEntity = new TricountEntity {
            Id = tricount.Id,
            Title = tricount.Title,
            Description = tricount.Description,
            Participants = tricount.Participants,
            //Creator = User.Identity?.Id apres la creation du login

        };
        if(tricount.Id == 0 ) {
            
        }
        return true;
    }
}