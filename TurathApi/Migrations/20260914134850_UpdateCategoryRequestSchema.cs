using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurathApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCategoryRequestSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "CategoryRequests");

            migrationBuilder.DropColumn(
                name: "ReviewedBy",
                table: "CategoryRequests");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "CategoryRequests",
                newName: "CategoryName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CategoryName",
                table: "CategoryRequests",
                newName: "Name");

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "CategoryRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ReviewedBy",
                table: "CategoryRequests",
                type: "uniqueidentifier",
                nullable: true);
        }
    }
}
