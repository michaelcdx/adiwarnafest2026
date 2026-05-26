namespace AdiwarnaBackend.Models.Teams
{
    public class TeamPlayerDto
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int PlayerNumber { get; set; }
    }
}
