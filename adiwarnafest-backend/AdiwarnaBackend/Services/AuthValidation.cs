using System.Net.Mail;

namespace AdiwarnaBackend.Services
{
    public static class AuthValidation
    {
        public static string NormalizeEmail(string email)
        {
            return email.Trim().ToLowerInvariant();
        }

        public static void ValidateEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required.");

            _ = new MailAddress(email);
        }

        public static void ValidatePassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password is required.");

            if (password.Length < 8)
                throw new ArgumentException("Password must be at least 8 characters long.");

            if (password.Length > 128)
                throw new ArgumentException("Password must be at most 128 characters long.");
        }
    }
}
