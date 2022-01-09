using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;
using Core.Helper.Classes;
using Core.Helper.Services;
using Microsoft.Extensions.Options;

namespace ExpensesTracker.Controllers.v1
{
    [Authorize]
    [ApiVersion("1.0")]
    [Route("api/v{v:apiVersion}/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly EmailService _emailService;

        public UsersController(IUserService service, IOptions<EmailSettings> options)
        {
            _service = service;
            _emailService = new EmailService(options);
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var users = await _service.GetUsersAsync();
            if (!users.Any()) return NoContent();
            return Ok(users);
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> Get(int userId)
        {
            var user = await _service.GetUserByIdAsync(userId);
            if (user == null) return BadRequest($"No user found with Id: {userId}");
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Post(UserDto userDto)
        {
            try
            {
                var newUser = await _service.InsertUserAsync(userDto);
                return Ok(newUser);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> SendSupportEmail(SupportContactMessage contactMessage)
        {
            try
            {
                var emailMessage = EmailMessagesService.CreateContactMessage(contactMessage);

                var checkSendMail =
                    await _emailService.SendEmailAsync("info@tomasi-developing.ch", emailMessage, "Kontaktformular");
                return Ok(checkSendMail);
            }
            catch (Exception)
            {
                return BadRequest("E-Mail konnte nicht gesendet werden");
            }
        }

        [HttpPut("{userId:int}/[action]")]
        public async Task<IActionResult> ChangeUserPassword(int userId, [FromBody] JsonObject requestBody)
        {
            try
            {
                var password = requestBody["newPassword"]?.ToString();
                if (string.IsNullOrEmpty(password)) return BadRequest("Password is empty!");
                var checkChangePassword = await _service.ChangeUserPasswordAsync(userId, password);
                return Ok(checkChangePassword);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPut("{userId:int}")]
        public async Task<IActionResult> Put(int userId, UserDto userDto)
        {
            try
            {
                if (userId != userDto.Id) return BadRequest("Error with userId");
                var userToUpdate = await _service.UpdateUserAsync(userId, userDto);
                return Ok(userToUpdate);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> Delete(int userId)
        {
            try
            {
                var checkDelete = await _service.DeleteUserAsync(userId);
                if (!checkDelete) return BadRequest($"User with Id: {userId} could not be deleted!");
                return Ok(checkDelete);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}