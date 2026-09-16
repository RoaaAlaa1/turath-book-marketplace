using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurathApi.Migrations
{
    /// <inheritdoc />
    public partial class FixCategoryRequestsCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys 
        WHERE name = 'FK_CategoryRequests_AspNetUsers_SellerId' 
        AND parent_object_id = OBJECT_ID('CategoryRequests')
    )
    BEGIN
        ALTER TABLE [CategoryRequests] DROP CONSTRAINT [FK_CategoryRequests_AspNetUsers_SellerId];
    END
");

            migrationBuilder.AlterColumn<string>(
                name: "SellerId",
                table: "CategoryRequests",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CategoryRequests_AspNetUsers_SellerId",
                table: "CategoryRequests",
                column: "SellerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
    IF EXISTS (
        SELECT 1 FROM sys.foreign_keys 
        WHERE name = 'FK_CategoryRequests_AspNetUsers_SellerId' 
        AND parent_object_id = OBJECT_ID('CategoryRequests')
    )
    BEGIN
        ALTER TABLE [CategoryRequests] DROP CONSTRAINT [FK_CategoryRequests_AspNetUsers_SellerId];
    END
");

            migrationBuilder.AddForeignKey(
                name: "FK_CategoryRequests_AspNetUsers_SellerId",
                table: "CategoryRequests",
                column: "SellerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}