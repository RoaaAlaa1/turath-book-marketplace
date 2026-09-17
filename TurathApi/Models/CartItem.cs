using System.Text.Json.Serialization;

namespace TurathApi.Models
{
    public class CartItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CartId { get; set; }

        [JsonIgnore]
        public Cart Cart { get; set; } = null!;

        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
