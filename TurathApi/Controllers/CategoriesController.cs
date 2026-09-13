using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;

namespace TurathApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/categories
        /// Returns all categories — used to populate the catalog's category filter.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAll()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }
    }
}
