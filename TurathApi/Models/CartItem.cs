using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TurathApi.Models
{
    [Table("CartItems")]
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        [Column("CustomerId")]
        public string CustomerId { get; set; } = string.Empty;

        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }
}
