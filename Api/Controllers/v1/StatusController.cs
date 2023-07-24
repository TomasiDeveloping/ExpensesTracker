using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]")]
[ApiController]
public class StatusController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            return Ok("Expense Tracker API is Running...");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}