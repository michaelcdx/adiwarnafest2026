using AdiwarnaBackend.Models.LuckyDraw;

namespace AdiwarnaBackend.Services
{
    public interface ILuckyDrawService
    {
        Task<bool> ScanQrAsync(Guid userId, string boothId);
        Task<LuckyDrawStatusDto> GetStatusAsync(Guid userId);
        Task<bool> SubmitEntryAsync(Guid userId, SubmitLuckyDrawEntryDto dto);
        Task<bool> HasSubmittedAsync(Guid userId);
        Task<List<LuckyDrawEntryExportDto>> GetAllEntriesAsync();
    }
}
