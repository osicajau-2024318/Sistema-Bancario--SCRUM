using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthServiceBanco.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountStateToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "account_state",
                table: "user",
                type: "integer",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "account_state",
                table: "user");
        }
    }
}
