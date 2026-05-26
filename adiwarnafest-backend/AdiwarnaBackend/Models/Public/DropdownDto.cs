namespace AdiwarnaBackend.Models.Public
{
    public class DropdownDto
    {
        public string Type { get; set; } = string.Empty;
        public List<DropdownOptionDto> Options { get; set; } = [];
    }
}
