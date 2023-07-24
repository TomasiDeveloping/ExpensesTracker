using AutoMapper;
using Core.DTOs;
using Core.Interfaces;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace DataBase.Services;

public class ApplicationVersionConfirmationService : IApplicationVersionConfirmationService
{
    private readonly ExpensesTrackerContext _context;
    private readonly IMapper _mapper;

    public ApplicationVersionConfirmationService(ExpensesTrackerContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<bool> CheckApplicationVersionConfirmedByUserIdAsync(
        ApplicationVersionConfirmationDto applicationVersionConfirmationDto)
    {
        var userConfirmed =
            await _context.ApplicationVersionConfirmations.FirstOrDefaultAsync(avc =>
                avc.UserId.Equals(applicationVersionConfirmationDto.UserId) &&
                avc.Version.Equals(applicationVersionConfirmationDto.Version));
        return userConfirmed != null;
    }

    public async Task<ApplicationVersionConfirmationDto> InsertApplicationVersionConfirmationAsync(
        ApplicationVersionConfirmationDto applicationVersionConfirmationDto)
    {
        var newConfirmation = _mapper.Map<ApplicationVersionConfirmation>(applicationVersionConfirmationDto);
        await _context.ApplicationVersionConfirmations.AddAsync(newConfirmation);
        await _context.SaveChangesAsync();
        return _mapper.Map<ApplicationVersionConfirmationDto>(newConfirmation);
    }
}