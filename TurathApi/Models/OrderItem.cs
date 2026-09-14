using System.Text.Json.Serialization;

namespace TurathApi.Models
{
    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid OrderId { get; set; }

        [JsonIgnore]
        public Order Order { get; set; } = null!;

        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
