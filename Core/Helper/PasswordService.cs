using System.Text;

namespace Core.Helper
{
    public static class PasswordService
    {
        public static Password CreateNewPassword(string clearTextPassword)
        {
            var password = new Password();
            using var hmac = new System.Security.Cryptography.HMACSHA512();
            password.PasswordSalt = hmac.Key;
            password.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(clearTextPassword));
            return password;
        }

        public static bool VerifyPassword(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using var hmac = new System.Security.Cryptography.HMACSHA512(passwordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return !computedHash.Where((t, i) => t != passwordHash[i]).Any();
        }
    }
}