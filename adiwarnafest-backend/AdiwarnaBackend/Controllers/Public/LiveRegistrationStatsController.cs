using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AdiwarnaBackend.Controllers.Public
{
    [Route("api/stats/live")]
    [ApiController]
    [Tags("Public")]
    public class LiveRegistrationStatsController(IConfiguration configuration, IHttpClientFactory httpClientFactory) : ControllerBase
    {
        private static CachedStats? _cachedStats;
        private static DateTime _lastFetch = DateTime.MinValue;

        private string AppsScriptUrl => configuration["LiveStats:GoogleSheetsUrl"]
            ?? "https://script.google.com/macros/s/AKfycbxwUHG4PUY5If7wCQwVlkiQ-WNaUvWRwDg3e5bXHBWnlvxyjnjX2UiaCuVzAx5g96ZQ2g/exec";

        [HttpGet]
        [EndpointSummary("Get live registration stats from Google Sheets")]
        [EndpointDescription("Fetches real-time registration data from Google Sheets via Apps Script. Data is cached for 30 seconds.")]
        public async Task<IActionResult> GetLiveStats()
        {
            try
            {
                if (_cachedStats != null && (DateTime.UtcNow - _lastFetch).TotalSeconds < 30)
                {
                    return Ok(ConvertToResponse(_cachedStats));
                }

                var _httpClient = httpClientFactory.CreateClient();
                var response = await _httpClient.GetStringAsync(AppsScriptUrl);
                _cachedStats = JsonSerializer.Deserialize<CachedStats>(response);
                _lastFetch = DateTime.UtcNow;

                return Ok(ConvertToResponse(_cachedStats));
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Failed to fetch live stats." });
            }
        }

        private object ConvertToResponse(CachedStats? stats)
        {
            if (stats == null) return new { };

            int totalTeams = stats.Basketball.Teams + stats.Futsal.Teams + stats.MobileLegends.Teams;
            int totalParticipants = stats.SportParticipants + stats.SimfoniParticipants;

            return new
            {
                totalTeams,
                sportParticipants = stats.SportParticipants,
                simfoniParticipants = stats.SimfoniParticipants,
                totalParticipants,
                basketball = new { teams = stats.Basketball.Teams, players = stats.Basketball.Players },
                futsal = new { teams = stats.Futsal.Teams, players = stats.Futsal.Players },
                mobileLegendsStats = new { teams = stats.MobileLegends.Teams, players = stats.MobileLegends.Players },
                lastUpdated = stats.LastUpdated
            };
        }
    }

    public class CachedStats
    {
        [System.Text.Json.Serialization.JsonPropertyName("totalTeams")]
        public int TotalTeams { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("sportParticipants")]
        public int SportParticipants { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("simfoniParticipants")]
        public int SimfoniParticipants { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("totalParticipants")]
        public int TotalParticipants { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("basketball")]
        public SportStats Basketball { get; set; } = new();

        [System.Text.Json.Serialization.JsonPropertyName("futsal")]
        public SportStats Futsal { get; set; } = new();

        [System.Text.Json.Serialization.JsonPropertyName("mobileLegends")]
        public SportStats MobileLegends { get; set; } = new();

        [System.Text.Json.Serialization.JsonPropertyName("lastUpdated")]
        public string LastUpdated { get; set; } = "";
    }

    public class SportStats
    {
        [System.Text.Json.Serialization.JsonPropertyName("teams")]
        public int Teams { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("players")]
        public int Players { get; set; }
    }
}
