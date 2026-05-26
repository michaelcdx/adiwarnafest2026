using Microsoft.AspNetCore.Hosting;

namespace AdiwarnaBackend.Services
{
    public class FileStorageService(IWebHostEnvironment environment) : IFileStorageService
    {
        public async Task<string> SaveTeamLogoAsync(Stream content, string fileName, Guid teamId, CancellationToken cancellationToken = default)
        {
            var extension = Path.GetExtension(fileName);
            var safeExtension = string.IsNullOrWhiteSpace(extension) ? ".bin" : extension;
            var fileNameOnDisk = $"{teamId}{safeExtension}";

            var rootPath = string.IsNullOrWhiteSpace(environment.WebRootPath)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : environment.WebRootPath;

            var relativeFolder = Path.Combine("uploads", "teams");
            var targetFolder = Path.Combine(rootPath, relativeFolder);
            Directory.CreateDirectory(targetFolder);

            var targetPath = Path.Combine(targetFolder, fileNameOnDisk);
            await using var stream = new FileStream(targetPath, FileMode.Create, FileAccess.Write, FileShare.None);
            await content.CopyToAsync(stream, cancellationToken);

            return "/" + Path.Combine(relativeFolder, fileNameOnDisk).Replace('\u005c', '/');
        }

        public Task DeleteTeamLogoAsync(string logoPath, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(logoPath))
                return Task.CompletedTask;

            var rootPath = string.IsNullOrWhiteSpace(environment.WebRootPath)
                ? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")
                : environment.WebRootPath;

            var absolutePath = Path.Combine(rootPath, logoPath.TrimStart('/'));

            if (System.IO.File.Exists(absolutePath))
            {
                System.IO.File.Delete(absolutePath);
            }

            return Task.CompletedTask;
        }
    }
}
