using Core.DTOs;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpensesTracker.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class ApplicationVersionConfirmationController : ControllerBase
{
    private readonly IApplicationVersionConfirmationService _applicationVersionConfirmationService;

    public ApplicationVersionConfirmationController(
        IApplicationVersionConfirmationService applicationVersionConfirmationService)
    {
        _applicationVersionConfirmationService = applicationVersionConfirmationService;
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
            return BadRequest(e.Message);
        }
    }
}