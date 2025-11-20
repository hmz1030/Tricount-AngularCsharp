using AutoMapper;
using AutoMapper.Execution;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Xml;
using Tricount.Helpers;
using Tricount.Models;
using Tricount.Models.DTO.Operation;
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


    [Authorize]
    [HttpPost("save_tricount")]
    public async Task<ActionResult<TricountDetailsDTO>> save_tricount([FromBody] TricountSaveDTO dto) {
        User? ConnectedUser = await GetConnectedUser();
        if (ConnectedUser == null) {
            return Unauthorized();
        }
        
        // participants
        var participants = await ConvertUsersIdsToUsers(dto.Participants ?? new List<int>());
        if(participants == null) {
            return BadRequest(new {
                code = "P0001",
                details = (string?)null,
                hint = (string?)null,
                message = "one or more participants not found"
            });
        }

        TricountEntity tricount;
        if(dto.Id == 0) {
            //Create
            //le createur est participant
            if (!participants.Any(p => p.Id == ConnectedUser.Id))
                participants.Add(ConnectedUser);

            tricount = new TricountEntity {
                Title = dto.Title,
                Description = dto.Description,
                Creator = ConnectedUser,
                CreatorId = ConnectedUser.Id,
                Participants = participants
            };

            var vr = await new TricountValidator(context).ValidateOnCreate(tricount);
            if (!vr.IsValid) {
                return BadRequest(new {
                    code = "P0001",
                    details = (string?)null,
                    hint = (string?)null,
                    message = string.Join("; ", vr.Errors.Select(e => e.ErrorMessage))
                });
            }
            context.Tricounts.Add(tricount);
        } else {
            //Update
            tricount = await context.Tricounts
                .Include(t => t.Participants)
                .Include(t => t.Operations)
                    .ThenInclude(o => o.Repartitions)
                .FirstOrDefaultAsync(t => t.Id == dto.Id);
           
            if(tricount == null) {
                return BadRequest(new {
                    code = "P0001",
                    details = (string?)null,
                    hint = (string?)null,
                    message = "tricount not found"
                });
            }
            bool isParticipant = tricount.Participants.Any(p => p.Id == ConnectedUser.Id);

            if (ConnectedUser.Role != Role.Admin && !isParticipant)
            {
                return BadRequest(new {
                    code = "P0001",
                    details = (string?)null,
                    hint = (string?)null,
                    message = "access denied"
                });
            }

            var newParticipantsIds = participants.Select(p => p.Id).ToHashSet();
            //on ne peut pas enlever le createur 
            var creatorId = tricount.CreatorId;
            if (!newParticipantsIds.Contains(creatorId)) {
                return BadRequest(new {
                    code = "P0001",
                    details = (string?)null,
                    hint = (string?)null,
                    message = "You cannot remove the participation of the owner of a tricount"
                });
            }

            //on ne peut pas enlever un participant impliqué dans des depenses
            var impliedUserIds = tricount.Operations
                .SelectMany(o =>
                    o.Repartitions.Select(r => r.UserId)
                        .Append(o.InitiatorId)
                )
                .Distinct()
                .ToList();
            var removedImpliedUserIds = impliedUserIds
                .Where(id => !newParticipantsIds.Contains(id))
                .ToList();

            if (removedImpliedUserIds.Any()) {
                return BadRequest(new {
                    code = "P0001",
                    details = (string?)null,
                    hint = (string?)null,
                    message = "You cannot remove a participant implied in operations for this tricount"
                });
            }

            tricount.Title = dto.Title;
            tricount.Description = dto.Description;
            tricount.Participants = participants;

            var vr = await new TricountValidator(context).ValidateOnUpdate(tricount);
            if (!vr.IsValid)
            {
                return BadRequest(new {
                    code = "P0001",
                    details = (string?)null,
                    hint = (string?)null,
                    message = string.Join("; ", vr.Errors.Select(e => e.ErrorMessage))
                });
            }
        }

        //sauvegarde
        await context.SaveChangesAsync();
        //afichage reponse
        var result = await context.Tricounts
            .AsNoTracking()
            .Include(t => t.Participants)
            .Include(t => t.Operations)
                .ThenInclude(o => o.Repartitions)
            .FirstAsync(t => t.Id == tricount.Id);
        
         result.Participants = result.Participants
            .OrderBy(p => p.Name)
            .ToList();

        result.Operations = result.Operations
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => {
                // 🔹 3. Pour chaque opération, trier les répartitions par UserId (1,2,3,…)
                o.Repartitions = o.Repartitions
                    .OrderBy(r => r.UserId)
                    .ToList();
                return o;
            })
            .ToList();
        return Ok(mapper.Map<TricountDetailsDTO>(result));
    }

    private async Task<User?> GetConnectedUser() {
        var email = User.Identity?.Name;
        User? user = await context.Users.FirstOrDefaultAsync(x => x.Email == email);
        return user != null ? user : null;
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

    private async Task<User?> GetUserById(int id) {
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
        var user = await GetConnectedUser();
        if (user == null) {
            return Unauthorized();
        }
        var isAdmin = User.IsInRole(Role.Admin.ToString());
        if (!isAdmin) {
        var isParticipant = await context.Participations
            .AnyAsync(p => p.TricountId == dto.TricountId && p.UserId == user.Id);
        
        if (!isParticipant)
            return Forbid();
    }
        if (dto.Id == 0) {
            var newOperation = mapper.Map<Operation>(dto);
            var validator = await new OperationValidator(context).ValidateOperation(newOperation);
            if (!validator.IsValid) {
                return BadRequest(new { message = string.Join("; ", validator.Errors.Select(e => e.ErrorMessage)) });
            }
            context.Operations.Add(newOperation);
            await context.SaveChangesAsync();
            var result = await context.Operations
          .AsNoTracking()
          .Include(o => o.Repartitions)
          .FirstAsync(o => o.Id == newOperation.Id);
            return mapper.Map<OperationDTO>(result);
        } else {
            var operation = await Operation.GetByIdWithRepartitions(context, dto.Id);

            if (operation == null)
                return NotFound();

            operation.Repartitions.Clear();
            mapper.Map(dto, operation);

            var validator = await new OperationValidator(context).ValidateOperation(operation);
            if (!validator.IsValid) {
                return BadRequest(new { message = string.Join("; ", validator.Errors.Select(e => e.ErrorMessage)) });
            }

            await context.SaveChangesAsync();
             var result = await context.Operations
            .AsNoTracking()
            .Include(o => o.Repartitions)
            .FirstAsync(o => o.Id == dto.Id);
            return mapper.Map<OperationDTO>(result);
        }
    }

    [Authorize]
    [HttpPost("delete_operation")]
    public async Task<ActionResult> DeleteOperation([FromBody] OperationDeleteDTO dto) {
        var operation = await context.Operations.FindAsync(dto.Id);
        var email = User.Identity?.Name;
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if(user == null)
            return Unauthorized();
        
        if (operation == null) {
           {
                return BadRequest(new {
                    code = "P0001",
                    details = (string?)null,
                    hint = (string?)null,
                    message = "operation not found"
                });
            }
        }

        if(user.Role != Role.Admin) {
            var isParticipant = await context.Participations
                .AnyAsync(p => p.TricountId == operation.TricountId && p.UserId == user.Id);

            if(!isParticipant)
                return Forbid();
        }
    
        context.Operations.Remove(operation);
        await context.SaveChangesAsync();  

        return NoContent();
    }
    
    [HttpPost("check_email_available")]
    public async Task<bool> check_email_available(UserMailCheckDTO dto) {
        return  !await context.Users.AnyAsync(e=> e.Email == dto.Email && e.Id != dto.Id);//true veut dire available
    }

    [HttpPost("check_full_name_available")]
    public async Task<bool> check_full_name_available(UserNameCheckDTO dto) {
        return !await context.Users.AnyAsync(e=> e.Name == dto.FullName && e.Id != dto.Id);//true veut dire available
    }

    [Authorize]
    [HttpGet("get_my_tricounts")]
    public async Task<ActionResult<IEnumerable<TricountDetailsDTO>>> GetMyTricounts() {

        var email = User.Identity?.Name;
        if(string.IsNullOrEmpty(email))
            return Unauthorized();
        
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if(user == null)
            return Unauthorized();

        IQueryable<TricountEntity> query = context.Tricounts
            .Include(t => t.Participants)
            .Include(t => t.Operations)
                .ThenInclude(o => o.Repartitions);

        if(user.Role != Role.Admin) {
            var userId = user.Id;
            query = query.Where(t => 
                t.CreatorId == userId ||
                t.Participants.Any(u => u.Id == userId)
                );
        }
        var tricounts = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var dto = mapper.Map<IEnumerable<TricountDetailsDTO>>(tricounts);
        return Ok(dto);
    }
    [Authorize]
    [HttpGet("get_tricount_balance")]
    public async Task<ActionResult<IEnumerable<TricountBalanceDTO>>> GetTricountBalance([FromQuery] int tricount_id) {
        var user = await GetConnectedUser();
        if (user == null)
            return Unauthorized();
        
        var tricount = await TricountEntity.GetByIdWithDetails(context, tricount_id);
        
        if (tricount == null)
            return NotFound();
        
        var isAdmin = User.IsInRole(Role.Admin.ToString());
        if (!isAdmin && tricount.CreatorId != user.Id && !tricount.Participants.Any(p => p.Id == user.Id))
            return Forbid();
        
        var balance = tricount.CalculateBalance();
        
        return Ok(balance);
    }

    [Authorize]
    [HttpPost("delete_tricount")]
    public async Task<ActionResult> DeleteTricount([FromBody] TricountDeleteDTO dto) {
        var tricount = await context.Tricounts
            .Include(t => t.Operations)
                .ThenInclude(o => o.Repartitions)
            .FirstOrDefaultAsync(t => t.Id == dto.Id);
        
        var email = User.Identity?.Name;
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
        
        if(user == null)
            return Unauthorized();
        
        if (tricount == null) {
            return BadRequest(new {
                code = "P0001",
                details = (string?)null,
                hint = (string?)null,
                message = "tricount not found"
            });
        }

        if(user.Role != Role.Admin) {
            if (tricount.CreatorId != user.Id) {
                return Forbid();
            }
        }
    
        // Supprimer d'abord toutes les operations et les répartitions ( en cascade)
        context.Operations.RemoveRange(tricount.Operations);
        
        // Ensuite supprimer le tricount
        context.Tricounts.Remove(tricount);
        await context.SaveChangesAsync();  

        return NoContent();
    }

    [HttpPost("check_tricount_title_available")]
    public async Task<IActionResult> check_tricount_title_available(TricountTitleCheckDTO dto) {
        //if tricount id is none existant then its a create so its always a true
        var c_email = User.Identity?.Name;

        if(string.IsNullOrEmpty(c_email)) {
            return Unauthorized("User not authenticated");
        }
        
        var user = await context.Users.FirstOrDefaultAsync(u=> u.Email == c_email);
        if(user == null) {
            return Unauthorized("User not found");
        }
        var creator_id = user.Id;
       
        //next step is 
        var answer =  !await context.Tricounts.AnyAsync(
            t=> t.CreatorId == creator_id && 
            t.Title.Trim().ToLower() == dto.Title.Trim().ToLower() && 
            t.Id != dto.Id);
        return Ok(answer);
    }

}