using System.Text.Json.Serialization;

namespace TurathApi.Models
{
    public class CartItem
    {
        public int Id { get; set; } // تم التعديل إلى int

        public int CartId { get; set; } // تم التعديل إلى int

        [JsonIgnore]
        public Cart Cart { get; set; } = null!;

        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
