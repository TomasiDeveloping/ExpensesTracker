﻿using System.Text.Json.Nodes;
using Asp.Versioning;
using Core.DTOs;
using Core.Helper.Classes;
using Core.Helper.Services;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]/[action]")]
[ApiController]
public class AuthController(ITokenService tokenService, IUserService userService, IOptions<EmailSettings> options,
    ILogger<AuthController> logger) : ControllerBase
{
    private readonly EmailService _emailService = new(options);

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> CheckEmailExists([FromQuery] string email)
    {
        var user = await userService.GetUserByEmailAsync(email);
        return Ok(user != null);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Login(Login login)
    {
        var user = await userService.GetUserByEmailForLoginAsync(login.Email);
        if (user == null) return BadRequest("E-Mail oder Passwort falsch!");
        if (!user.IsActive) return BadRequest("Dein Account is Inaktiv, bitte melde Dich beim Support");

        var verifyUserPassword = PasswordService.VerifyPassword(login.Password, user.Password, user.Salt);
        if (verifyUserPassword)
            return Ok(new AppUserDto
            {
                FirstName = user.FirstName,
                UserId = user.Id,
                Token = tokenService.CreateToken(user.Id.ToString(), user.Email)
            });
        logger.LogWarning($"Login failed for {login.Email}");
        return BadRequest("E-Mail oder Passwort falsch!");
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Register(Register register)
    {
        var newUser = await userService.InsertUserAsync(new UserDto
        {
            CreatedAt = DateTime.Now,
            Email = register.Email,
            FirstName = register.FirstName,
            LastName = register.LastName,
            MonthlyBudget = 0,
            IsActive = true,
            Password = register.Password
        });
        logger.LogInformation($"A new user with the email {newUser.Email} has registered");
        return Ok(new AppUserDto
        {
            FirstName = newUser.FirstName,
            UserId = newUser.Id,
            Token = tokenService.CreateToken(newUser.Id.ToString(), newUser.Email)
        });
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> ForgotPassword([FromBody] JsonObject requestJsonObject)
    {
        try
        {
            var email = requestJsonObject["email"]?.ToString();
            if (string.IsNullOrEmpty(email)) return BadRequest("Keine E-mMil Adresse!");

            var user = await userService.GetUserByEmailAsync(email);
            if (user == null)
            {
                logger.LogWarning($"Forgotten password was requested with unregistered email {email}");
                return BadRequest("E-Mail nicht Registriert!");
            }

            var randomPassword = PasswordService.CreateRandomPassword();
            var checkUpdatePassword = await userService.ChangeUserPasswordAsync(user.Id, randomPassword);
            if (!checkUpdatePassword)
            {
                logger.LogError($"Password for user {user.Email} could not be changed");
                return BadRequest("Passwort konnte nicht geändert werden!");
            }

            var message = EmailMessagesService.CreateForgotPasswordMessage(randomPassword);
            var checkEmailSend = await _emailService.SendEmailAsync(user.Email, message, "Neues Passwort");
            if (!checkEmailSend)
            {
                logger.LogError($"Email with new password for {user.Email} could not be sent");
                return BadRequest("E-Mail mit neuem Passwort konnte nicht gesendet werden!");
            }

            return Ok(true);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(ForgotPassword)}");
            return BadRequest(e.Message);
        }
    }
}