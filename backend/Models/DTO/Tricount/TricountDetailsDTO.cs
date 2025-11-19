using System.Text.Json.Serialization;
using Tricount.Models.DTO.User;

namespace Tricount.Models.DTO.Tricount;

public class TricountDetailsDTO 
{
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime Created_at { get; set; }
        public int Creator { get; set; }
        public List<UserDTO> Participants { get; set; } = new();
        public List<OperationDTO> Operations { get; set; } = new();
}