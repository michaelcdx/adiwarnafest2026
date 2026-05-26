using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdiwarnaBackend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamNavigationToGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Games_Team1Id",
                table: "Games",
                column: "Team1Id");

            migrationBuilder.CreateIndex(
                name: "IX_Games_Team2Id",
                table: "Games",
                column: "Team2Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Teams_Team1Id",
                table: "Games",
                column: "Team1Id",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Teams_Team2Id",
                table: "Games",
                column: "Team2Id",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Games_Teams_Team1Id",
                table: "Games");

            migrationBuilder.DropForeignKey(
                name: "FK_Games_Teams_Team2Id",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_Team1Id",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_Team2Id",
                table: "Games");
        }
    }
}
