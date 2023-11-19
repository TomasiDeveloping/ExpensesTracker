using Asp.Versioning;
using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class ApplicationVersionConfirmationController(
    IApplicationVersionConfirmationService applicationVersionConfirmationService,
    ILogger<ApplicationVersionConfirmationController> logger) : ControllerBase
{
    [HttpPost("[action]")]
    public async Task<IActionResult> UserHasVersionConfirmed(
        [FromBody] ApplicationVersionConfirmationDto applicationVersionConfirmationDto)
    {
        try
        {
            return Ok(await applicationVersionConfirmationService.CheckApplicationVersionConfirmedByUserIdAsync(
                applicationVersionConfirmationDto));
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(UserHasVersionConfirmed)}");
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
                await applicationVersionConfirmationService.InsertApplicationVersionConfirmationAsync(
                    applicationVersionConfirmationDto);
            return Ok(newApplicationVersionConfirmationDto);
        }
        catch (Exception e)
        {
            logger.LogError(e, $"Something Went Wrong in {nameof(InsertApplicationVersionConfirmation)}");
            return BadRequest(e.Message);
        }
    }
}