using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace TurathApi.Models
{
    [Table("CartItems")]
    public class CartItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public Guid CartId { get; set; }

        [JsonIgnore]
        public Cart Cart { get; set; } = null!;

        public Guid ProductId { get; set; }

        public int Quantity { get; set; }
    }
}