using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tricount.Helpers;
using Tricount.Models;
using Tricount.Models.DTO;
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
    public async Task<ActionResult<UserDTO>> Signup ([FromBody] UserDTO userDTO, [FromServices] UserValidator validator) {
        var userForValidation = new User {
            Email = userDTO.Email,
            Password = userDTO.Password,
            Name = userDTO.Name,
            Iban  = string.IsNullOrWhiteSpace(userDTO.Iban) ? null : userDTO.Iban.Trim(),
            Role = Role.User
        };

        var vr = await validator.ValidateOnCreate(userForValidation);
        if (!vr.IsValid)
            return BadRequest(new {
                code = "P0001",
                details = (string?)null,
                hint = (string?)null,
                message = string.Join("; ", vr.Errors.Select(e => e.ErrorMessage))
            });

        var userToSave = new User {
            Email = userForValidation.Email,
            Password = TokenHelper.GetPasswordHash(userForValidation.Password),
            Name = userForValidation.Name,
            Iban = userForValidation.Iban,
            Role = userForValidation.Role
        };
        
        context.Users.Add(userToSave);
        await context.SaveChangesAsync();

        return NoContent();
    }
}