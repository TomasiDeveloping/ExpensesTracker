using Core.DTOs;
using Core.Models;

namespace Core.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(string userId, string userEmail);
    }
}
