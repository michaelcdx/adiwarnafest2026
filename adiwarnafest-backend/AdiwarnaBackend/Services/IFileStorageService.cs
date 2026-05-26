namespace AdiwarnaBackend.Services
{
    public interface IFileStorageService
    {
        Task<string> SaveTeamLogoAsync(Stream content, string fileName, Guid teamId, CancellationToken cancellationToken = default);
        Task DeleteTeamLogoAsync(string logoPath, CancellationToken cancellationToken = default);
    }
}
