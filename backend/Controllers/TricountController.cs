using AutoMapper;
using AutoMapper.Execution;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
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
            //Participants = tricount.Participants,
            //Creator = User.Identity?.Id apres la creation du login

        };
        if (tricount.Id == 0) {

        }
        return true;
    }

    //all anonym juste pour le test pcq le login pas encore fait, apres faudra enlever le allowanonymous
    [AllowAnonymous]
    [HttpGet("get_all_users")]
    public async Task<ActionResult<List<UserDTO>>> GetAllUsers() {
        var users = await context.Users.OrderBy(u => u.Name).ToListAsync();
        return mapper.Map<List<UserDTO>>(users);
    }
    //Login
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UserLoginDTO>> Login(UserWithPasswordDTO dto) {
        var user = await Login(dto.Email, dto.Password);
        var result = await new UserValidator(context).ValidateForLogin(user);
        if (!result.IsValid)
            return BadRequest(result);
        return Ok(mapper.Map<LoginTokenDTO>(user));
    }
    
    private async Task<User?> Login(string email, string password) {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
            return null;

        if (user.Password == password) {
            user.Token = TokenHelper.GenerateJwtToken(email, user.Role);
        }

        return user;
        
    }
}