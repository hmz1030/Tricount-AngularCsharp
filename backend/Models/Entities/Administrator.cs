using Tricount.Models.Entities;

public class Administrator : User
{
    public Administrator() {
        Role = Role.Admin;
    }
        
    
}