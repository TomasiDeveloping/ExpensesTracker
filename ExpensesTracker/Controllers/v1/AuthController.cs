using Core.DTOs;
using Core.Helper;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpensesTracker.Controllers.v1
{
    [ApiVersion("1.0")]
    [Route("api/v{v:apiVersion}/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;

        public AuthController(ITokenService tokenService, IUserService userService)
        {
            _tokenService = tokenService;
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost("[action]")]
        public async Task<IActionResult> Login(Login login)
        {
            var user = await _userService.GetUserByEmailForLoginAsync(login.Email);
            if (user == null) return BadRequest("E-Mail oder Passwort falsch!");
            if (!user.IsActive) return BadRequest("Dein Account is Inaktiv, bitte melde Dich beim Support");

            var verifyUserPassword = PasswordService.VerifyPassword(login.Password, user.Password, user.Salt);
            if (!verifyUserPassword) return BadRequest("E-Mail oder Passwort falsch!");

            return Ok(new AppUserDto()
            {
                FirstName = user.FirstName,
                UserId = user.Id,
                Token = _tokenService.CreateToken(user.Id.ToString(), user.Email)
            });
        }

        [AllowAnonymous]
        [HttpPost("[action]")]
        public async Task<IActionResult> Register(Register register)
        {
            var newUser = await _userService.InsertUserAsync(new UserDto()
            {
                CreatedAt = DateTime.Now,
                Email = register.Email,
                FirstName = register.FirstName,
                LastName = register.LastName,
                MonthlyBudget = 0,
                IsActive = true,
                Password = register.Password
            });
            return Ok(new AppUserDto()
            {
                FirstName = newUser.FirstName,
                UserId = newUser.Id,
                Token = _tokenService.CreateToken(newUser.Id.ToString(), newUser.Email)
            });
        }
    }
}
