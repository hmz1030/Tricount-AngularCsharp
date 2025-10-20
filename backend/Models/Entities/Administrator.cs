using Tricount.Models.Entities;

class Administrator : User
{
    public Administrator(string name, string email, string password)
        : base(name, email, password)
    {
        Role = Role.Admin;
    }
}