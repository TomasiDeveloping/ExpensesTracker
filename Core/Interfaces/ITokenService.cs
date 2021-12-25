namespace Core.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(string userId, string userEmail);
    }
}
