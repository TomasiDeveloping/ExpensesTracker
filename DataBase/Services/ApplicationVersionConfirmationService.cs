using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class ApplicationVersionConfirmationService
    (ExpensesTrackerContext context, IMapper mapper) : IApplicationVersionConfirmationService
{
    public async Task<bool> CheckApplicationVersionConfirmedByUserIdAsync(
        ApplicationVersionConfirmationDto applicationVersionConfirmationDto)
    {
        var userConfirmed =
            await context.ApplicationVersionConfirmations.FirstOrDefaultAsync(avc =>
                avc.UserId.Equals(applicationVersionConfirmationDto.UserId) &&
                avc.Version.Equals(applicationVersionConfirmationDto.Version));
        return userConfirmed != null;
    }

    public async Task<ApplicationVersionConfirmationDto> InsertApplicationVersionConfirmationAsync(
        ApplicationVersionConfirmationDto applicationVersionConfirmationDto)
    {
        var newConfirmation = mapper.Map<ApplicationVersionConfirmation>(applicationVersionConfirmationDto);
        await context.ApplicationVersionConfirmations.AddAsync(newConfirmation);
        await context.SaveChangesAsync();
        return mapper.Map<ApplicationVersionConfirmationDto>(newConfirmation);
    }
}