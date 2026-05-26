using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AdiwarnaBackend.Entities
{
    public class Player
    {
        public Guid Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public Guid TeamId { get; set; }
        
        [Required]
        [Range(0, 99)]
        public int PlayerNumber { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Goals { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Foul1 { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Foul2 { get; set; }
        
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        [JsonIgnore]
        public Team? Team { get; set; }
        
        [JsonIgnore]
        public ICollection<PlayerGameStat> PlayerGameStats { get; set; } = new List<PlayerGameStat>();
    }
}