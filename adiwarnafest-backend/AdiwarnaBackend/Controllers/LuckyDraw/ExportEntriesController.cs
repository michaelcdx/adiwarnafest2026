using AdiwarnaBackend.Models.LuckyDraw;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace AdiwarnaBackend.Controllers.LuckyDraw
{
    [Route("api/lucky-draw")]
    [Tags("Lucky Draw")]
    [Authorize(Roles = "Admin,Maintainer")]
    public class ExportEntriesController(ILuckyDrawService luckyDrawService) : ControllerBase
    {
        [HttpGet("entries")]
        [EndpointSummary("Get Lucky Draw Entries")]
        [EndpointDescription("Get all lucky draw entries as JSON. Admin and Maintainer only.")]
        public async Task<ActionResult<List<LuckyDrawEntryExportDto>>> GetEntries()
        {
            var entries = await luckyDrawService.GetAllEntriesAsync();
            return Ok(entries);
        }

        [HttpGet("export-entries")]
        [EndpointSummary("Export Lucky Draw Entries")]
        [EndpointDescription("Download all lucky draw entries as a CSV file. Admin and Maintainer only.")]
        public async Task<IActionResult> ExportEntries()
        {
            var entries = await luckyDrawService.GetAllEntriesAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Full Name,Phone Number,Instagram Handle,Registered Email,Submitted At");

            foreach (var entry in entries)
            {
                var escapedName = EscapeCsvField(entry.FullName);
                var escapedPhone = EscapeCsvField(entry.PhoneNumber);
                var escapedInstagram = EscapeCsvField(entry.InstagramHandle);
                var escapedEmail = EscapeCsvField(entry.RegisteredEmail);

                csv.AppendLine($"{escapedName},{escapedPhone},{escapedInstagram},{escapedEmail},{entry.SubmittedAt:yyyy-MM-dd HH:mm:ss}");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            var filename = $"lucky-draw-entries-{DateTime.UtcNow:yyyy-MM-dd-HHmmss}.csv";

            return File(bytes, "text/csv", filename);
        }

        private string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return "\"\"";

            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }

            return field;
        }
    }
}
