/*
 * File: MultiTableService.cs
 * Implements data fetching from SOAP UI endpoints for multiple platform types.
 * Provides fallback mock data when endpoints are unavailable.
 */

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    // =========================================================
    // MULTI-TABLE SERVICE
    // Fetches MSAN, VPN, and SLBN data from configured SOAP UI endpoints
    // =========================================================
    public class MultiTableService : IMultiTableService
    {
        // HTTP client for making requests to SOAP UI endpoints
        private readonly HttpClient _httpClient;

        // Configuration for endpoint URLs and settings
        private readonly IConfiguration _configuration;

        public MultiTableService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        // Fetches MSAN (Metro Software Area Network) platform data
        public async Task<List<PlatformRecordDto>> FetchMsanDataAsync()
        {
            return await FetchFromSoapUiAsync("Msan");
        }

        // Fetches VPN (Virtual Private Network) platform data
        public async Task<List<PlatformRecordDto>> FetchVpnDataAsync()
        {
            return await FetchFromSoapUiAsync("Vpn");
        }

        // Fetches SLBN (Service Level Backbone Network) platform data
        public async Task<List<PlatformRecordDto>> FetchSlbnDataAsync()
        {
            return await FetchFromSoapUiAsync("Slbn");
        }

        /// <summary>
        /// Fetches data from configured SOAP UI endpoint for the specified platform type.
        /// Endpoint URLs should be configured in appsettings.json under the SoapUi section.
        /// Example: "SoapUi:MsanEndpoint": "http://localhost:8080/endpoint"
        /// Falls back to mock data if endpoint is unavailable or request fails.
        /// </summary>
        private async Task<List<PlatformRecordDto>> FetchFromSoapUiAsync(string platformType)
        {
            try
            {
                // Get endpoint URL from configuration
                var endpoint = _configuration[$"SoapUi:{platformType}Endpoint"];

                if (string.IsNullOrEmpty(endpoint))
                {
                    // Endpoint not configured, return mock data
                    return GetMockData(platformType);
                }

                // Make HTTP GET request to SOAP UI endpoint
                var response = await _httpClient.GetAsync(endpoint);
                
                if (!response.IsSuccessStatusCode)
                {
                    // Request failed, return mock data
                    return GetMockData(platformType);
                }

                // Parse successful response
                var content = await response.Content.ReadAsStringAsync();
                return ParseResponse(content, platformType);
            }
            catch (Exception ex)
            {
                // Log error and return mock data
                Console.WriteLine($"Error fetching {platformType} data: {ex.Message}");
                return GetMockData(platformType);
            }
        }

        /// <summary>
        /// Returns sample/mock data for the platform type.
        /// Used when actual SOAP UI endpoint is unavailable or during development.
        /// Replace with real parsing when actual SOAP UI response format is known.
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
        /// Parses SOAP UI HTTP response into platform record format.
        /// Currently returns mock data.
        /// TODO: Implement actual parsing based on real SOAP UI response format once available.
        /// </summary>
        private List<PlatformRecordDto> ParseResponse(string responseContent, string platformType)
        {
            // TODO: Implement actual parsing based on SOAP UI response format
            // For now, return mock data
            return GetMockData(platformType);
        }
    }
}
