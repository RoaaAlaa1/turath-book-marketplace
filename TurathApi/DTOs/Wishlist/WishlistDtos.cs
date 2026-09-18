namespace TurathApi.DTOs.Wishlist
{
    public class AddWishlistItemDto
    {
        public int BookId { get; set; }
    }

    public class WishlistItemDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime AddedAt { get; set; }
    }
}