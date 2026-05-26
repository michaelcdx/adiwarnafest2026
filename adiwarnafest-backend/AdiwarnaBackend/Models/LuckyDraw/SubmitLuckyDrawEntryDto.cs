using System.ComponentModel.DataAnnotations;

namespace AdiwarnaBackend.Models.LuckyDraw
{
    public class SubmitLuckyDrawEntryDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [RegularExpression(@"^\+?[0-9\s\-]{7,20}$", ErrorMessage = "Invalid phone number format.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [RegularExpression(@"^@?[A-Za-z0-9._]{1,50}$", ErrorMessage = "Invalid Instagram handle format.")]
        public string InstagramHandle { get; set; } = string.Empty;
    }
}
