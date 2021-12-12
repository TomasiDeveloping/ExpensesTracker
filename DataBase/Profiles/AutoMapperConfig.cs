using AutoMapper;
using Core.DTOs;
using Core.Models;

namespace DataBase.Profiles
{
    public class AutoMapperConfig : Profile
    {
        public AutoMapperConfig()
        {
            CreateMap<User, UserDto>()
                .ForMember(src => src.Password, o => o.Ignore());
            CreateMap<UserDto, User>()
                .ForMember(src => src.Password, o => o.Ignore())
                .ForMember(src => src.Salt, o => o.Ignore());

            CreateMap<Category, CategoryDto>();
            CreateMap<CategoryDto, Category>()
                .ForMember(src => src.User, o => o.Ignore());

            CreateMap<Expense, ExpenseDto>()
                .ForMember(src => src.CategoryName, o => o.MapFrom(c => c.Category.Name));
            CreateMap<ExpenseDto, Expense>()
                .ForMember(src => src.User, o => o.Ignore())
                .ForMember(src => src.Category, o => o.Ignore());
        }
    }
}