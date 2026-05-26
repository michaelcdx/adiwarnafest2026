using AdiwarnaBackend.Data;
using AdiwarnaBackend.Entities;
using AdiwarnaBackend.Models.LuckyDraw;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AdiwarnaBackend.Services
{
    public class LuckyDrawService(AdiwarnaDbContext dbContext, HttpClient httpClient) : ILuckyDrawService
    {
        public async Task<bool> ScanQrAsync(Guid userId, string boothId)
        {
            // Check if user has already scanned this booth
            var existingScan = await dbContext.QrScans
                .FirstOrDefaultAsync(q => q.UserId == userId && q.BoothId == boothId);

            if (existingScan != null)
                return false;

            var qrScan = new QrScan
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BoothId = boothId,
                ScannedAt = DateTime.UtcNow
            };

            dbContext.QrScans.Add(qrScan);
            await dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<LuckyDrawStatusDto> GetStatusAsync(Guid userId)
        {
            var scans = await dbContext.QrScans
                .Where(q => q.UserId == userId)
                .OrderBy(q => q.ScannedAt)
                .ToListAsync();

            var hasSubmitted = await dbContext.LuckyDrawEntries
                .AnyAsync(l => l.UserId == userId);

            var dto = new LuckyDrawStatusDto
            {
                ScannedBooths = scans.Select(s => new QrScanDto
                {
                    Id = s.Id,
                    BoothId = s.BoothId,
                    ScannedAt = s.ScannedAt
                }).ToList(),
                IsEligible = scans.Count >= 3,
                HasSubmitted = hasSubmitted
            };

            return dto;
        }

        public async Task<bool> SubmitEntryAsync(Guid userId, SubmitLuckyDrawEntryDto dto)
        {
            // Check if user has already submitted
            var existingEntry = await dbContext.LuckyDrawEntries
                .FirstOrDefaultAsync(l => l.UserId == userId);

            if (existingEntry != null)
                return false;

            // Check if user has scanned 3 booths
            var scanCount = await dbContext.QrScans
                .Where(q => q.UserId == userId)
                .Distinct()
                .CountAsync(q => true);

            if (scanCount < 3)
                return false;

            var entry = new LuckyDrawEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                InstagramHandle = dto.InstagramHandle,
                SubmittedAt = DateTime.UtcNow
            };

            dbContext.LuckyDrawEntries.Add(entry);
            await dbContext.SaveChangesAsync();

            // Send to Google Sheets (fire-and-forget)
            _ = SendToGoogleSheetsAsync(dto);

            return true;
        }

        private async Task SendToGoogleSheetsAsync(SubmitLuckyDrawEntryDto dto)
        {
            try
            {
                const string googleAppsScriptUrl = "https://script.google.com/macros/s/AKfycbzPCsBCWRBkQ4O0mAtXHkUtcGII0PM1SSwjJH_ENN3H9JaF6jYhCqEeAF1C1gaAbqY/exec";

                var json = JsonSerializer.Serialize(new
                {
                    fullName = dto.FullName,
                    phoneNumber = dto.PhoneNumber,
                    instagramHandle = dto.InstagramHandle
                });

                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                await httpClient.PostAsync(googleAppsScriptUrl, content);
            }
            catch (Exception ex)
            {
                // Silently log error - Google Sheets sync is non-critical
                Console.WriteLine($"Google Sheets sync failed (non-critical): {ex.Message}");
            }
        }

        public async Task<bool> HasSubmittedAsync(Guid userId)
        {
            return await dbContext.LuckyDrawEntries
                .AnyAsync(l => l.UserId == userId);
        }

        public async Task<List<LuckyDrawEntryExportDto>> GetAllEntriesAsync()
        {
            var entries = await dbContext.LuckyDrawEntries
                .OrderByDescending(l => l.SubmittedAt)
                .Select(l => new LuckyDrawEntryExportDto
                {
                    FullName = l.FullName,
                    PhoneNumber = l.PhoneNumber,
                    InstagramHandle = l.InstagramHandle,
                    SubmittedAt = l.SubmittedAt
                })
                .ToListAsync();

            return entries;
        }
    }
}
