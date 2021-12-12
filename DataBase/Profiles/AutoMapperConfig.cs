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
        }
    }
}
