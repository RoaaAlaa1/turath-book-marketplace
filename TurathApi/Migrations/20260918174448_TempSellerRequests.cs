using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurathApi.Migrations
{
    public partial class TempSellerRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SellerRequests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    user_id = table.Column<string>(type: "nvarchar(450)", nullable: false),

                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),

                    requested_at = table.Column<DateTime>(type: "datetime2", nullable: false),

                    processed_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellerRequests", x => x.id);

                    table.ForeignKey(
                        name: "FK_SellerRequests_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SellerRequests_user_id",
                table: "SellerRequests",
                column: "user_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SellerRequests");
        }
    }
}
