namespace TurathApi.Models
{
    using System;
    using System.Collections.Generic;

    public class Cart
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CustomerId { get; set; }
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}