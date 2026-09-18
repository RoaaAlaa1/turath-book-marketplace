namespace TurathApi.Models
{
    public class Cart
    {
        public int Id { get; set; } // تأكد إنها int مش Guid

        public string CustomerId { get; set; } = null!;

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
