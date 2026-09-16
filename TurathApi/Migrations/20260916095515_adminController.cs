using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurathApi.Migrations
{
    /// <inheritdoc />
    public partial class adminController : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_CategoryRequests_SellerId",
                table: "CategoryRequests",
                column: "SellerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CategoryRequests_SellerId",
                table: "CategoryRequests");
        }
    }
}
