using Asp.Versioning;
using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class ApplicationVersionConfirmationController : ControllerBase
{
    private readonly IApplicationVersionConfirmationService _applicationVersionConfirmationService;
    private readonly ILogger<ApplicationVersionConfirmationController> _logger;

    public ApplicationVersionConfirmationController(
        IApplicationVersionConfirmationService applicationVersionConfirmationService,
        ILogger<ApplicationVersionConfirmationController> logger)
    {
        _applicationVersionConfirmationService = applicationVersionConfirmationService;
        _logger = logger;
    }

    [HttpPost("[action]")]
    public async Task<IActionResult> UserHasVersionConfirmed(
        [FromBody] ApplicationVersionConfirmationDto applicationVersionConfirmationDto)
    {
        try
        {
            return Ok(await _applicationVersionConfirmationService.CheckApplicationVersionConfirmedByUserIdAsync(
                applicationVersionConfirmationDto));
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(UserHasVersionConfirmed)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> InsertApplicationVersionConfirmation(
        ApplicationVersionConfirmationDto applicationVersionConfirmationDto)
    {
        try
        {
            var newApplicationVersionConfirmationDto =
                await _applicationVersionConfirmationService.InsertApplicationVersionConfirmationAsync(
                    applicationVersionConfirmationDto);
            return Ok(newApplicationVersionConfirmationDto);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(InsertApplicationVersionConfirmation)}");
            return BadRequest(e.Message);
        }
    }
}