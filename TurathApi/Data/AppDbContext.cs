using Microsoft.EntityFrameworkCore;
using TurathApi.Models;

namespace TurathApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Reviews> Reviews { get; set; }
    }
}