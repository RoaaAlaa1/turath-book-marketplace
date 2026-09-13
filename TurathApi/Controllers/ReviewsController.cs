using Microsoft.EntityFrameworkCore;
using TurathApi.Data;
using TurathApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace TurathApi.Controllers
{
    public class ReviewsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(AppDbContext context, ILogger<ReviewsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: Reviews
        public async Task<IActionResult> Index()
        {
            try
            {
                var reviews = await _context.Reviews.AsNoTracking().ToListAsync();
                return View(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reviews: {Message}", ex.Message);
                return RedirectToAction("Error");
            }
        }

        // GET: Reviews/Details/5
        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);

                if (review == null)
                {
                    return NotFound();
                }

                return View(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review with id: {ReviewId}", id);
                return RedirectToAction("Error");
            }
        }

        // GET: Reviews/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Reviews/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Reviews review)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    _context.Reviews.Add(review);
                    await _context.SaveChangesAsync();
                    return RedirectToAction(nameof(Index));
                }
                return View(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return View(review);
            }
        }

        // GET: Reviews/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound();
                }
                return View(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review for edit");
                return RedirectToAction("Error");
            }
        }

        // POST: Reviews/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Reviews review)
        {
            if (id != review.id)
            {
                return NotFound();
            }

            try
            {
                if (ModelState.IsValid)
                {
                    _context.Reviews.Update(review);
                    await _context.SaveChangesAsync();
                    return RedirectToAction(nameof(Index));
                }
                return View(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review");
                return View(review);
            }
        }

        // GET: Reviews/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                {
                    return NotFound();
                }
                return View(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving review for delete");
                return RedirectToAction("Error");
            }
        }

        // POST: Reviews/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review != null)
                {
                    _context.Reviews.Remove(review);
                    await _context.SaveChangesAsync();
                }
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review");
                return RedirectToAction("Error");
            }
        }
    }
}