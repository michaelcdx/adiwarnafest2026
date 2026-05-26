using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AdiwarnaBackend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTeam1Team2ToGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Games_TournamentId",
                table: "Games");

            migrationBuilder.AddColumn<string>(
                name: "GameType",
                table: "Tournaments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "Team1Id",
                table: "Games",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "Team2Id",
                table: "Games",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Games_TournamentId_Team1Id",
                table: "Games",
                columns: new[] { "TournamentId", "Team1Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Games_TournamentId_Team2Id",
                table: "Games",
                columns: new[] { "TournamentId", "Team2Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Games_TournamentId_Team1Id",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_TournamentId_Team2Id",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "GameType",
                table: "Tournaments");

            migrationBuilder.DropColumn(
                name: "Team1Id",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Team2Id",
                table: "Games");

            migrationBuilder.CreateIndex(
                name: "IX_Games_TournamentId",
                table: "Games",
                column: "TournamentId");
        }
    }
}
