using TurathApi.DTOs;
using TurathApi.DTOs.Cart;
using TurathApi.Models;

namespace TurathApi.Services.Interfaces
{
    public interface ICartService
    {
        Task<Cart?> GetCartByCustomerIdAsync(string customerId);
        Task AddToCartAsync(AddToCartDto dto);
        Task<bool> UpdateCartItemAsync(UpdateCartItemDto dto);
        Task<bool> RemoveCartItemAsync(RemoveCartItemDto dto);
        Task<Guid> CheckoutAsync(string customerId);
    }
}