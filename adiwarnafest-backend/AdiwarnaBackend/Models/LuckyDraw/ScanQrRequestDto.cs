using System.ComponentModel.DataAnnotations;

namespace AdiwarnaBackend.Models.LuckyDraw
{
    public class ScanQrRequestDto
    {
        [Required]
        [MaxLength(50)]
        public string BoothId { get; set; } = string.Empty;
    }
}
