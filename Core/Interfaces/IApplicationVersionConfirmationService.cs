using Core.DTOs;

namespace Core.Interfaces;

public interface IApplicationVersionConfirmationService
{
    Task<bool> CheckApplicationVersionConfirmedByUserIdAsync(
        ApplicationVersionConfirmationDto applicationVersionConfirmationDto);

    Task<ApplicationVersionConfirmationDto> InsertApplicationVersionConfirmationAsync(
        ApplicationVersionConfirmationDto applicationVersionConfirmationDto);
}