using System.Text.Json.Nodes;
using Asp.Versioning;
using Core.DTOs;
using Core.Helper.Classes;
using Core.Helper.Services;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Api.Controllers.v1;

[Authorize]
[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class UsersController(IUserService service, IOptions<EmailSettings> options, ILogger<UsersController> logger) : ControllerBase
{
    private readonly EmailService _emailService = new(options);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var users = await service.GetUsersAsync();
        if (!users.Any()) return NoContent();
        return Ok(users);
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> Get(int userId)
    {
        var user = await service.GetUserByIdAsync(userId);
        if (user == null) return NotFound($"No user found with Id: {userId}");
        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(UserDto userDto)
    {
        try
        {
            var newUser = await service.InsertUserAsync(userDto);
            return Ok(newUser);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(CreateUser)}");
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
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(SendSupportEmail)}");
            return BadRequest("E-Mail konnte nicht gesendet werden");
        }
    }

    [HttpPut("{userId}/[action]")]
    public async Task<IActionResult> ChangeUserPassword(int userId, [FromBody] JsonObject requestBody)
    {
        try
        {
            var password = requestBody["newPassword"]?.ToString();
            if (string.IsNullOrEmpty(password)) return BadRequest("Password is empty!");
            var checkChangePassword = await service.ChangeUserPasswordAsync(userId, password);
            return Ok(checkChangePassword);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(ChangeUserPassword)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateUser(int userId, UserDto userDto)
    {
        try
        {
            if (userId != userDto.Id) return BadRequest("Error with userId");
            var userToUpdate = await service.UpdateUserAsync(userId, userDto);
            return Ok(userToUpdate);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(UpdateUser)}");
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(int userId)
    {
        try
        {
            var checkDelete = await service.DeleteUserAsync(userId);
            if (!checkDelete) return BadRequest($"User with Id: {userId} could not be deleted!");
            return Ok(true);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(DeleteUser)}");
            return BadRequest(e.Message);
        }
    }
}