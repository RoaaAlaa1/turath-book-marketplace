using TurathApi.Models.Enums;

namespace TurathApi.DTOs.Seller
{
    public class UpdateOrderStatusDto
    {
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
    }
}