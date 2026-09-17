namespace TurathApi.Models
{
    public class Cart
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CustomerId { get; set; } = string.Empty;

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
