using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tricount.Models;
using Tricount.Models.DTO;
using Tricount.Models.Entities;

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
    public async Task<ActionResult<UserDTO>> Signup (UserDTO userDTO, TricountContext context) {
        var user = new User {
            Email = userDTO.Email,
            Password = userDTO.Password,
            Name = userDTO.Name,
            Iban = userDTO.Iban,
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        return NoContent();
    }
}