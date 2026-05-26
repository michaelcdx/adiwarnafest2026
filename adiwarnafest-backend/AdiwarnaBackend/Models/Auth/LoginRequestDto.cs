using System.ComponentModel.DataAnnotations;

namespace AdiwarnaBackend.Models.Auth
{
    public class LoginRequestDto
    {
        [Required]
        [MaxLength(254)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }
}
