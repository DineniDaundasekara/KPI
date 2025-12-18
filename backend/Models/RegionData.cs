using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("regiontables")] // Change this to your actual table name
public class RegionData
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = string.Empty;

    [Column("region")]
    public string Region { get; set; } = string.Empty;

    [Column("province")]
    public string Province { get; set; } = string.Empty;

    [Column("networkEngineer")]
    public string NetworkEngineer { get; set; } = string.Empty;

    [Column("lea")]
    public string Lea { get; set; } = string.Empty;

    [Column("createdAt")]
    public DateTime? CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime? UpdatedAt { get; set; }

    [Column("v")]
    public byte __v { get; set; }
}
