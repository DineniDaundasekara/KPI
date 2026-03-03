using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IMultiTableService
    {
        Task<List<PlatformRecordDto>> FetchMsanDataAsync();
        Task<List<PlatformRecordDto>> FetchVpnDataAsync();
        Task<List<PlatformRecordDto>> FetchSlbnDataAsync();
    }

    public class PlatformRecordDto
    {
        public string Month { get; set; } = string.Empty;
        public List<PlatformDetailDto> Details { get; set; } = new();
    }

    public class PlatformDetailDto
    {
        public string Column1 { get; set; } = string.Empty;
        public object? Column2 { get; set; }
        public object? Column3 { get; set; }
        public object? Column4 { get; set; }
    }
}
