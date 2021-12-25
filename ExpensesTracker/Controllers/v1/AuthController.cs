using System.Text.Json.Nodes;
using Core.DTOs;
using Core.Helper.Classes;
using Core.Helper.Services;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace ExpensesTracker.Controllers.v1
{
    [ApiVersion("1.0")]
    [Route("api/v{v:apiVersion}/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly EmailService _emailService;

        public AuthController(ITokenService tokenService, IUserService userService, IOptions<EmailSettings> options)
        {
            _tokenService = tokenService;
            _userService = userService;
            _emailService = new EmailService(options);
        }

        [AllowAnonymous]
        [HttpGet("[action]")]
        public async Task<IActionResult> CheckEmailExists([FromQuery] string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            return Ok(user != null);
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

        [AllowAnonymous]
        [HttpPost("[action]")]
        public async Task<IActionResult> ForgotPassword([FromBody] JsonObject requestJsonObject)
        {
            try
            {
                var email = requestJsonObject["email"]?.ToString();
                if (string.IsNullOrEmpty(email)) return BadRequest("Keine E-mMil Adresse!");

                var user = await _userService.GetUserByEmailAsync(email);
                if (user == null) return BadRequest("E-Mail nicht Registriert!");

                var randomPassword = PasswordService.CreateRandomPassword();
                var checkUpdatePassword = await _userService.ChangeUserPasswordAsync(user.Id, randomPassword);
                if (!checkUpdatePassword) return BadRequest("Passwort konnte nicht geändert werden!");

                var message = EmailMessagesService.CreateForgotPasswordMessage(randomPassword);
                var checkEmailSend = await _emailService.SendEmailAsync(user.Email, message, "Neues Passwort");
                if (!checkEmailSend) return BadRequest("E-Mail mit neuem Passwort konnte nicht gesendet werden!");
                return Ok(true);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
