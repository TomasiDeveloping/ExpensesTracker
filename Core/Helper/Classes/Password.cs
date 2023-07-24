namespace Core.Helper.Classes;

public class Password
{
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
}