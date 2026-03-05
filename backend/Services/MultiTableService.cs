using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public class MultiTableService : IMultiTableService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public MultiTableService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<List<PlatformRecordDto>> FetchMsanDataAsync()
        {
            return await FetchFromSoapUiAsync("Msan");
        }

        public async Task<List<PlatformRecordDto>> FetchVpnDataAsync()
        {
            return await FetchFromSoapUiAsync("Vpn");
        }

        public async Task<List<PlatformRecordDto>> FetchSlbnDataAsync()
        {
            return await FetchFromSoapUiAsync("Slbn");
        }

        /// <summary>
        /// Fetches data from SOAP UI endpoint
        /// Configure endpoints in appsettings.json under SoapUi section
        /// </summary>
        private async Task<List<PlatformRecordDto>> FetchFromSoapUiAsync(string platformType)
        {
            try
            {
                // Get endpoint from config
                var endpoint = _configuration[$"SoapUi:{platformType}Endpoint"];

                if (string.IsNullOrEmpty(endpoint))
                {
                    // Return mock data for now
                    return GetMockData(platformType);
                }

                // Make HTTP request to SOAP UI
                var response = await _httpClient.GetAsync(endpoint);
                
                if (!response.IsSuccessStatusCode)
                {
                    return GetMockData(platformType);
                }

                var content = await response.Content.ReadAsStringAsync();
                return ParseResponse(content, platformType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching {platformType} data: {ex.Message}");
                return GetMockData(platformType);
            }
        }

        /// <summary>
        /// Mock data - replace with real parsing when you have SOAP UI format
        /// </summary>
        private List<PlatformRecordDto> GetMockData(string platformType)
        {
            return new List<PlatformRecordDto>
            {
                new PlatformRecordDto
                {
                    Month = "January",
                    Details = new List<PlatformDetailDto>
                    {
                        new PlatformDetailDto { Column1 = "NW/WPC-1", Column2 = "100.00%", Column3 = "Compliant", Column4 = "Report" },
                        new PlatformDetailDto { Column1 = "NW/WPC-2", Column2 = "98.50%", Column3 = "Compliant", Column4 = "Report" },
                        new PlatformDetailDto { Column1 = "NW/WPNE", Column2 = "99.75%", Column3 = "Compliant", Column4 = "Report" }
                    }
                },
                new PlatformRecordDto
                {
                    Month = "February",
                    Details = new List<PlatformDetailDto>
                    {
                        new PlatformDetailDto { Column1 = "NW/WPC-1", Column2 = "100.00%", Column3 = "Compliant", Column4 = "Report" },
                        new PlatformDetailDto { Column1 = "NW/WPC-2", Column2 = "99.00%", Column3 = "Compliant", Column4 = "Report" },
                        new PlatformDetailDto { Column1 = "NW/WPNE", Column2 = "100.00%", Column3 = "Compliant", Column4 = "Report" }
                    }
                }
            };
        }

        /// <summary>
        /// Parse SOAP UI response - update based on actual format when you receive it
        /// </summary>
        private List<PlatformRecordDto> ParseResponse(string responseContent, string platformType)
        {
            // TODO: Implement actual parsing based on SOAP UI response format
            // For now, return mock data
            return GetMockData(platformType);
        }
    }
}
