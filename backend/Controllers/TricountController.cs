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
            Participants = await ConvertUsersIdsToUsers(tricount.Participants)?? new HashSet<User>(),
            //Creator = User.Identity?

        };
        if (tricount.Id == 0) {

        }
        return true;
    }

    private async Task<ICollection<User>?> ConvertUsersIdsToUsers(List<int> ids) {
        HashSet<User> users = new HashSet<User>();
        for (int i = 0; i < ids.Count; i++) {
            User? user = await GetUserById(ids[i]);
            if (user == null) {
                return null;
            }
            users.Add(user);
        }
        return users;
    }

    public async Task<User?> GetUserById(int id) {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) {
            return null;
        }
        return user;
    }

    

    [HttpGet("get_all_users")]
    public async Task<ActionResult<List<UserDTO>>> GetAllUsers() {
        var users = await context.Users.OrderBy(u => u.Name).ToListAsync();
        return mapper.Map<List<UserDTO>>(users);
    }
    //Login
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDTO>> Login(LoginRequestDTO dto) {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            return BadRequest(new { message = "Invalid email or password" });

        var hashedPassword = TokenHelper.GetPasswordHash(dto.Password);
        if (user.Password != hashedPassword)
            return BadRequest(new { message = "Invalid email or password" });

        var token = TokenHelper.GenerateJwtToken(user.Email, user.Role);

        return Ok(new LoginResponseDTO { Token = token });
    }
    [HttpGet("get_user_data")]
    public async Task<ActionResult<UserDTO>> GetUserData() {
        var mail = User.Identity?.Name;
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == mail);
        if (user == null) {
            return BadRequest(new { message = "User not found" });

        }
        return mapper.Map<UserDTO>(user);


    }
    [HttpPost("save_operation")]
public async Task<ActionResult<OperationDTO>> SaveOperation(OperationSaveDTO dto) {
    if (dto.Id == 0) {
        var newOperation = mapper.Map<Operation>(dto);
        var validator = await new OperationValidator(context).ValidateOperation(newOperation);
        if (!validator.IsValid) {
            return BadRequest(new { message = string.Join("; ", validator.Errors.Select(e => e.ErrorMessage)) });
        }
        context.Operations.Add(newOperation);
        await context.SaveChangesAsync();
        return mapper.Map<OperationDTO>(newOperation);
    } else {
        var operation = await context.Operations
            .Include(o => o.Repartitions)
            .FirstOrDefaultAsync(o => o.Id == dto.Id);
        
        if (operation == null)
            return NotFound();
        
        operation.Repartitions.Clear();
        mapper.Map(dto, operation);
        
        var validator = await new OperationValidator(context).ValidateOperation(operation);
        if (!validator.IsValid) {
            return BadRequest(new { message = string.Join("; ", validator.Errors.Select(e => e.ErrorMessage)) });
        }
        
        await context.SaveChangesAsync();
        return mapper.Map<OperationDTO>(operation);
    }
}

}