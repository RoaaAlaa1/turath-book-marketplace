<<<<<<< HEAD
﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TurathApi.Models
{
    [Table("CartItems")]
=======
﻿using System.Text.Json.Serialization;

namespace TurathApi.Models
{
>>>>>>> b21604e709b97a38ad204c004fa9d31733422be5
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

<<<<<<< HEAD
        [Column("CustomerId")]
        public string CustomerId { get; set; } = string.Empty;

        public int ProductId { get; set; }
=======
        public Guid CartId { get; set; }

        [JsonIgnore]
        public Cart Cart { get; set; } = null!;
>>>>>>> b21604e709b97a38ad204c004fa9d31733422be5

        public int Quantity { get; set; }
    }
}
