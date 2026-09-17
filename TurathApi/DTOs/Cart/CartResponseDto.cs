namespace TurathApi.DTOs.Cart
{
    public class CartItemResponseDto
    {
        public Guid Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal => UnitPrice * Quantity;
    }

    public class CartResponseDto
    {
        public Guid CartId { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public List<CartItemResponseDto> Items { get; set; } = new();
        public decimal TotalAmount => Items.Sum(i => i.Subtotal);
    }
}