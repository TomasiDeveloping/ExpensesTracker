using ClosedXML.Excel;
using Core.Helper.Classes;

namespace Core.Interfaces
{
    public interface IReportService
    {
        Task<XLWorkbook> CreateYearlyExcelReportAsync(Report report);

        Task<XLWorkbook> CreateMonthlyExcelReportAsync(Report report);
    }
}
