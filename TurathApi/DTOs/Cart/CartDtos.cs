using System;
using System.ComponentModel.DataAnnotations;

namespace TurathApi.DTOs
{
    public class AddToCartDto
    {
        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public int ProductId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }

    public class RemoveCartItemDto
    {
        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public int ProductId { get; set; }
    }

    public class CheckoutDto
    {
        [Required]
        public string CustomerId { get; set; } = string.Empty;
    }
}