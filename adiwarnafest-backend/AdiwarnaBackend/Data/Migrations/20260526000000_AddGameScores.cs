using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdiwarnaBackend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGameScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Team1Score",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Team2Score",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Team1Score",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Team2Score",
                table: "Games");
        }
    }
}
