// Models/TmActivityPlan.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("TmActivityPlans")]
    public class TmActivityPlan
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        // Corresponds to 'no'
        public string No { get; set; }
        
        [Required]
        public string Kpi { get; set; }
        
        public string Target { get; set; }
        
        public string Calculation { get; set; }
        
        public string Platform { get; set; }
        
        public string ResponsibleDGM { get; set; }
        
        public string DefinedOLADetails { get; set; }
        
        public string DataSources { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; }
    }
}