using Asp.Versioning;
using Core.Helper.Classes;
using Core.Helper.Services;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[Authorize]
[ApiVersion("1.0")]
[Route("api/v{v:apiVersion}/[controller]/[action]")]
[ApiController]
public class ReportsController : ControllerBase
{
    private readonly ILogger<ReportsController> _logger;
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateYearlyExcelReport(Report report)
    {
        try
        {
            var workBook = await _reportService.CreateYearlyExcelReportAsync(report);
            await using var stream = new MemoryStream();
            workBook.SaveAs(stream);
            var content = stream.ToArray();
            var filename = $"Statistik_{report.Year}.xlsx";
            Response.Headers.Append("x-file-name", filename);
            Response.Headers.Append("Access-Control-Expose-Headers", "x-file-name");
            return File(
                content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(CreateYearlyExcelReport)}");
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateMonthlyExcelReport(Report report)
    {
        try
        {
            var workbook = await _reportService.CreateMonthlyExcelReportAsync(report);
            await using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();
            var filename = $"Statistik_{ExcelService.GetMonthName(report.Month)}_{report.Year}.xlsx";
            if (report.Month == 3) filename = $"Statistik_Maerz_{report.Year}.xlsx";
            Response.Headers.Append("x-file-name", filename);
            Response.Headers.Append("Access-Control-Expose-Headers", "x-file-name");
            return File(
                content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Something Went Wrong in {nameof(CreateMonthlyExcelReport)}");
            return BadRequest(e.Message);
        }
    }
}