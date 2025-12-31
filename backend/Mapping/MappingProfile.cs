// Mappings/MappingProfile.cs
using AutoMapper;
using backend.DTOs;
using backend.Models;

namespace backend.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<TmActivityPlan, TmActivityPlanDto>().ReverseMap();
            CreateMap<CreateTmActivityPlanDto, TmActivityPlan>();
            CreateMap<UpdateTmActivityPlanDto, TmActivityPlan>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}