using TurathApi.Models.Enums;

namespace TurathApi.DTOs
{
    public class UpdateOrderStatusDto
    {
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
    }
}