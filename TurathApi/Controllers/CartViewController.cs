using Microsoft.AspNetCore.Mvc;

namespace TurathApi.Controllers
{
    public class CartViewController : Controller
    {
        [HttpGet("/Cart")]
        [HttpGet("/Cart/Index")]
        public IActionResult Index()
        {
            return View("~/Views/Cart/Index.cshtml");
        }
    }
}
