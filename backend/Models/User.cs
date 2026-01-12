using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class User
    {
        public string id { get; set; } = "";
        public short? username { get; set; } // CHANGED: short → short? (nullable)
        public string name { get; set; } = "";
        public string role { get; set; } = "";
        public string isActive { get; set; } = "";

        // Pages stored as separate columns
        public string? pages_0 { get; set; }
        public string? pages_1 { get; set; }
        public string? pages_2 { get; set; }
        public string? pages_3 { get; set; }
        public string? pages_4 { get; set; }
        public string? pages_5 { get; set; }
        public string? pages_6 { get; set; }
        public string? pages_7 { get; set; }
        public string? pages_8 { get; set; }

        public string createdAt { get; set; } = "";
        public string updatedAt { get; set; } = "";
        public bool? v { get; set; } // CHANGED: bool → bool? (nullable)

        [NotMapped]
        public List<string> Pages
        {
            get
            {
                var pages = new List<string>();
                if (!string.IsNullOrEmpty(pages_0)) pages.Add(pages_0);
                if (!string.IsNullOrEmpty(pages_1)) pages.Add(pages_1);
                if (!string.IsNullOrEmpty(pages_2)) pages.Add(pages_2);
                if (!string.IsNullOrEmpty(pages_3)) pages.Add(pages_3);
                if (!string.IsNullOrEmpty(pages_4)) pages.Add(pages_4);
                if (!string.IsNullOrEmpty(pages_5)) pages.Add(pages_5);
                if (!string.IsNullOrEmpty(pages_6)) pages.Add(pages_6);
                if (!string.IsNullOrEmpty(pages_7)) pages.Add(pages_7);
                if (!string.IsNullOrEmpty(pages_8)) pages.Add(pages_8);
                return pages;
            }
            set
            {
                // Clear all pages first
                pages_0 = pages_1 = pages_2 = pages_3 = pages_4 =
                pages_5 = pages_6 = pages_7 = pages_8 = null;

                // Set the pages based on the list
                if (value != null && value.Count > 0)
                {
                    for (int i = 0; i < Math.Min(value.Count, 9); i++)
                    {
                        switch (i)
                        {
                            case 0: pages_0 = value[i]; break;
                            case 1: pages_1 = value[i]; break;
                            case 2: pages_2 = value[i]; break;
                            case 3: pages_3 = value[i]; break;
                            case 4: pages_4 = value[i]; break;
                            case 5: pages_5 = value[i]; break;
                            case 6: pages_6 = value[i]; break;
                            case 7: pages_7 = value[i]; break;
                            case 8: pages_8 = value[i]; break;
                        }
                    }
                }
            }
        }
    }
}