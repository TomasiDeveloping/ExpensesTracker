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

            CreateMap<Revenue, RevenueDto>()
                .ForMember(src => src.CategoryName, o => o.MapFrom(r => r.RevenueCategory.Name));
            CreateMap<RevenueDto, Revenue>()
                .ForMember(src => src.User, o => o.Ignore())
                .ForMember(src => src.RevenueCategory, o => o.Ignore());

            CreateMap<RevenueCategory, RevenueCategoryDto>();
            CreateMap<RevenueCategoryDto, RevenueCategory>()
                .ForMember(src => src.User, o => o.Ignore());
        }
    }
}