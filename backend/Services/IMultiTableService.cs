/*
 * File: IMultiTableService.cs
 * Service interface and DTOs for fetching multi-table platform data from SOAP UI endpoints.
 * Supports MSAN, VPN, and SLBN data retrieval.
 */

using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    // =========================================================
    // MULTI-TABLE SERVICE INTERFACE
    // Defines contract for fetching platform data from SOAP UI
    // =========================================================
    public interface IMultiTableService
    {
        // Fetches MSAN (Metro Software Area Network) platform data
        Task<List<PlatformRecordDto>> FetchMsanDataAsync();

        // Fetches VPN (Virtual Private Network) platform data
        Task<List<PlatformRecordDto>> FetchVpnDataAsync();

        // Fetches SLBN (Service Level Backbone Network) platform data
        Task<List<PlatformRecordDto>> FetchSlbnDataAsync();
    }

    // =========================================================
    // PLATFORM RECORD DTO
    // Represents monthly platform data with details
    // =========================================================
    public class PlatformRecordDto
    {
        // Month identifier for the data
        public string Month { get; set; } = string.Empty;

        // Collection of platform details for the month
        public List<PlatformDetailDto> Details { get; set; } = new();
    }

    // =========================================================
    // PLATFORM DETAIL DTO
    // Represents individual platform detail columns
    // =========================================================
    public class PlatformDetailDto
    {
        // First column: identifier or key value
        public string Column1 { get; set; } = string.Empty;

        // Second column: metric or status value
        public object? Column2 { get; set; }

        // Third column: compliance or status indicator
        public object? Column3 { get; set; }

        // Fourth column: action or reference value
        public object? Column4 { get; set; }
    }
}
