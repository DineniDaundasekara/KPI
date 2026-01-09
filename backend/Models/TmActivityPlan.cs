using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    // FILE NAME STAYS: TmActivityPlan.cs
    // CLASS NAME USED BY CODE: TmActivity1
    [Table("tmtable1", Schema = "dbo")]
    public class TmActivity1
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // DB: tinyint
        public byte? No { get; set; }

        [Required]
        public string Kpi { get; set; } = null!;

        public string? Target { get; set; }
        public string? Calculation { get; set; }
        public string? Platform { get; set; }
        public string? ResponsibleDGM { get; set; }
        public string? DefinedOLADetails { get; set; }
        public string? DataSources { get; set; }

        // DB columns are nvarchar
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }

        // DB: tinyint
        public byte? V { get; set; }
    }
}
