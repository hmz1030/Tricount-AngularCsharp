using Tricount.Models.Entities;

public class TicountDTO
{
    public string Title { get; set; }
    public string Description { get; set; }
    public int Creator { get; set; }
    //public List<Participant> Participants { get; set; }
    public DateTime CreationDate { get; set;}
}