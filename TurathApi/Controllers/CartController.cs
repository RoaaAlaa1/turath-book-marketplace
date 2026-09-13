using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

[Route("api/[controller]")]
[ApiController]
public class CartController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CartController(ApplicationDbContext context)
    {
        _context = context;
    }

    // 1. عرض محتوى سلة المستخدم
    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetCart(string customerId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null)
        {
            return NotFound(new { message = "Cart is empty or not found for this customer." });
        }

        return Ok(cart);
    }

    // 2. إضافة منتج للسلة
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

        if (cart == null)
        {
            cart = new Cart { CustomerId = dto.CustomerId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        // نبحث هل المنتج موجود بالفعل في السلة ولا لأ
        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == dto.ProductId);

        if (cartItem != null)
        {
            cartItem.Quantity += dto.Quantity;
            _context.CartItems.Update(cartItem);
        }
        else
        {
            cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Item added to cart successfully." });
    }
    // 3. تعديل كمية منتج في السلة
    [HttpPut("update-item")]
    public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto dto)
    {
        var cart = await _context.Carts
            .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

        if (cart == null)
        {
            return NotFound(new { message = "Cart not found." });
        }

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == dto.ProductId);

        if (cartItem == null)
        {
            return NotFound(new { message = "Item not found in cart." });
        }

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(cartItem);
        }
        else
        {
            cartItem.Quantity = dto.Quantity;
            _context.CartItems.Update(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cart updated successfully." });
    }

    // 4. حذف منتج معين من السلة
    [HttpDelete("remove-item")]
    public async Task<IActionResult> RemoveCartItem([FromBody] RemoveCartItemDto dto)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

        if (cart == null)
        {
            return NotFound(new { message = "Cart not found." });
        }

        var cartItem = cart.CartItems.FirstOrDefault(i => i.ProductId == dto.ProductId);
        if (cartItem == null)
        {
            return NotFound(new { message = "Item not found in cart." });
        }

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Item removed from cart successfully." });
    }

    // 5. إتمام الشراء (Checkout Flow) وتحويل السلة لـ Order
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

        if (cart == null || !cart.CartItems.Any())
        {
            return BadRequest(new { message = "Cart is empty, cannot checkout." });
        }

        decimal totalAmount = cart.CartItems.Sum(item => item.Quantity * 10); // سعر مؤقت

        var order = new Order
        {
            CustomerId = dto.CustomerId,
            Total = totalAmount,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        foreach (var cartItem in cart.CartItems)
        {
            order.OrderItems.Add(new OrderItem
            {
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity,
                Price = 10
            });
        }

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.CartItems);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Checkout completed successfully.", orderId = order.Id });
    }
}

// الـ DTOs الخاصة باستقبال البيانات
public class AddToCartDto
{
    public string CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartItemDto
{
    public string CustomerId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class RemoveCartItemDto
{
    public string CustomerId { get; set; }
    public Guid ProductId { get; set; }
}

public class CheckoutDto
{
    public string CustomerId { get; set; }
}
