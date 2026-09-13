using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TurathApi.Migrations
{
    /// <inheritdoc />
    public partial class BooksCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    author = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    category_id = table.Column<int>(type: "int", nullable: false),
                    seller_id = table.Column<int>(type: "int", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    condition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    age_rating = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    approval_status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.id);
                    table.ForeignKey(
                        name: "FK_Books_Categories_category_id",
                        column: x => x.category_id,
                        principalTable: "Categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "id", "description", "name" },
                values: new object[,]
                {
                    { 1, null, "Fiction" },
                    { 2, null, "Science & Technology" },
                    { 3, null, "Children's Books" },
                    { 4, null, "History" }
                });

            migrationBuilder.InsertData(
                table: "Books",
                columns: new[] { "id", "age_rating", "approval_status", "author", "category_id", "condition", "description", "image_url", "price", "quantity", "seller_id", "title" },
                values: new object[,]
                {
                    { 1, "All Ages", "Approved", "Paulo Coelho", 1, "LikeNew", "A shepherd boy's journey to find treasure and discover his personal legend.", "/images/books/the-alchemist.jpg", 85.00m, 4, 1, "The Alchemist" },
                    { 2, "All Ages", "Approved", "Robert C. Martin", 2, "Good", "A handbook of agile software craftsmanship, covering principles and practices for writing readable, maintainable code.", "/images/books/clean-code.jpg", 220.00m, 2, 2, "Clean Code" },
                    { 3, "8+", "Approved", "E. B. White", 3, "Acceptable", "A classic story of friendship between a pig named Wilbur and a spider named Charlotte.", "/images/books/charlottes-web.jpg", 60.00m, 6, 3, "Charlotte's Web" },
                    { 4, "16+", "Approved", "Yuval Noah Harari", 4, "Good", "An exploration of how Homo sapiens came to dominate the world, from the cognitive revolution to today.", "/images/books/sapiens.jpg", 150.00m, 3, 1, "Sapiens: A Brief History of Humankind" },
                    { 5, "All Ages", "Pending", "Unknown", 1, "Acceptable", "Awaiting copyright verification before it can be listed publicly.", "/images/books/placeholder.jpg", 40.00m, 1, 2, "Untitled Manuscript Draft" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Books_category_id",
                table: "Books",
                column: "category_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Books");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
