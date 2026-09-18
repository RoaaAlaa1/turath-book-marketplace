namespace TurathApi.DTOs.Seller
{
    public class SellerOrderDto
    {
        public Guid OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<SellerOrderItemDto> Items { get; set; } = new();
    }

    public class SellerOrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }


}
