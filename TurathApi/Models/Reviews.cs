using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TurathApi.Models
{
    [Table("Reviews")]
    public class Reviews
    {
        [Key] [Required] public int id { get; set; }  
        public int customer_id { get; set; }
        public int book_id { get; set; }
        public int rating { get; set; }
        public string comment { get; set; }
        public DateTime created_at { get; set; } = DateTime.Now;





    }
}


