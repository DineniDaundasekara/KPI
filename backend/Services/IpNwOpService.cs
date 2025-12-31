using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public class IpNwOpService
    {
        private readonly AppDbContext _context;

        public IpNwOpService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<IpNwOp>> GetAllAsync()
        {
            // This is where the crash was happening. 
            // Now that the Model matches the DB types, this will work.
            return await _context.IpNwOps.ToListAsync();
        }

        public async Task<IpNwOp?> GetByIdAsync(string id)
        {
            return await _context.IpNwOps.FirstOrDefaultAsync(item => item.Id == id);
        }

        public async Task<IpNwOp> AddAsync(IpNwOp row)
        {
            row.Year = DateTime.Now.Year;

            // FIXED: Since UnavailableMinutesId is a string, use "0" instead of 0
            // Or simply let it be null if the DB allows it.
            row.UnavailableMinutesId ??= "0";

            _context.IpNwOps.Add(row);
            await _context.SaveChangesAsync();
            return row;
        }

        public async Task<bool> UpdateAsync(string id, IpNwOp row)
        {
            var existingRow = await GetByIdAsync(id);
            if (existingRow == null) return false;

            existingRow.No = row.No;
            existingRow.NetworkEngineerKpi = row.NetworkEngineerKpi;
            existingRow.Division = row.Division;
            existingRow.Section = row.Section;
            existingRow.KpiPercent = row.KpiPercent;
            existingRow.Year = DateTime.Now.Year;

            // Map the new column as well
            existingRow.UnavailableMinutesId = row.UnavailableMinutesId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var row = await GetByIdAsync(id);
            if (row == null) return false;

            _context.IpNwOps.Remove(row);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}