using AdiwarnaBackend.Models.LuckyDraw;
using AdiwarnaBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AdiwarnaBackend.Controllers.LuckyDraw
{
    [Route("api/lucky-draw")]
    [Tags("Lucky Draw")]
    [Authorize]
    public class ScanQrController(ILuckyDrawService luckyDrawService) : ControllerBase
    {
        [HttpPost("scan-qr")]
        [EndpointSummary("Scan QR Code")]
        [EndpointDescription("Scan a QR code from a game booth to mark it as completed.")]
        public async Task<ActionResult<bool>> ScanQr([FromBody] ScanQrRequestDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
                return Unauthorized("Invalid user.");

            var result = await luckyDrawService.ScanQrAsync(userGuid, request.BoothId);
            if (!result)
                return BadRequest("This booth has already been scanned or invalid booth ID.");

            return Ok(true);
        }

        [HttpGet("status")]
        [EndpointSummary("Get Lucky Draw Status")]
        [EndpointDescription("Get the current status of the user's lucky draw progress.")]
        public async Task<ActionResult<LuckyDrawStatusDto>> GetStatus()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
                return Unauthorized("Invalid user.");

            var status = await luckyDrawService.GetStatusAsync(userGuid);
            return Ok(status);
        }

        [HttpPost("submit-entry")]
        [EndpointSummary("Submit Lucky Draw Entry")]
        [EndpointDescription("Submit your information to participate in the lucky draw. You must have scanned all 3 booths.")]
        public async Task<ActionResult<bool>> SubmitEntry([FromBody] SubmitLuckyDrawEntryDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userId, out var userGuid))
                return Unauthorized("Invalid user.");

            var result = await luckyDrawService.SubmitEntryAsync(userGuid, request);
            if (!result)
                return BadRequest("You have either already submitted an entry or have not scanned all 3 booths yet.");

            return Ok(true);
        }
    }
}
