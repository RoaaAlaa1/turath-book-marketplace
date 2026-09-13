namespace TurathApi.DTOs
{
    public class AddToCartDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class RemoveCartItemDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public Guid ProductId { get; set; }
    }

    public class CheckoutDto
    {
        public string CustomerId { get; set; } = string.Empty;
    }
}
