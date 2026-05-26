# Retry only the 7 failed teams
param(
    [Parameter(Mandatory=$true)][string]$Email,
    [Parameter(Mandatory=$true)][string]$Password,
    [string]$ApiBase = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

Write-Host "Logging in as $Email..." -ForegroundColor Cyan
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$ApiBase/api/auth/login" -Method POST `
    -ContentType "application/json" -Body $loginBody
$token = $loginResp.accessToken
Write-Host "Login OK." -ForegroundColor Green

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

$teams = @(
    @{
        name = "PagiSore"; gameType = "Basketball5v5"
        players = 91..105 | ForEach-Object { @{ name = "Player $_"; playerNumber = ($_ % 100) } }
    },
    @{
        name = "Pria Ganas Beringas"; gameType = "Mobile Legends"
        players = @(
            @{ name = "Gideon Gunadi";              playerNumber = 1 },
            @{ name = "Jeffrey Joey";               playerNumber = 2 },
            @{ name = "David Kurniawan";            playerNumber = 3 },
            @{ name = "Emerson Austin Pranajaya";   playerNumber = 4 },
            @{ name = "Clements Rainheart Pontoan"; playerNumber = 5 }
        )
    },
    @{
        name = "ADUH"; gameType = "Mobile Legends"
        players = @(
            @{ name = "Jireh Veikha Adria";           playerNumber = 1 },
            @{ name = "Felicia Stephanie Angwen";     playerNumber = 2 },
            @{ name = "Ryo Fraderick Maxwell Tjive";  playerNumber = 3 },
            @{ name = "Kenjie Sanjaya";               playerNumber = 4 },
            @{ name = "Marvel Christian Fustin Phoe"; playerNumber = 5 }
        )
    },
    @{
        name = "SON N FAMS"; gameType = "Mobile Legends"
        players = @(
            @{ name = "Elson Tan";                    playerNumber = 1 },
            @{ name = "I Putu Agastya Pratama";       playerNumber = 2 },
            @{ name = "Bryan Maycello";               playerNumber = 3 },
            @{ name = "Christopher Alexander Tedja";  playerNumber = 4 },
            @{ name = "Daniel Febrian Peter";         playerNumber = 5 },
            @{ name = "Fransiskus Sean Andrew";       playerNumber = 6 },
            @{ name = "Cleon Filbert Wijaya";         playerNumber = 7 }
        )
    },
    @{
        name = "Poke"; gameType = "Mobile Legends"
        players = @(
            @{ name = "Gilbert Enrique";         playerNumber = 1 },
            @{ name = "Steven Allen Supranata";  playerNumber = 2 },
            @{ name = "Christian Aurelio Young"; playerNumber = 3 },
            @{ name = "Ferix Taurius";           playerNumber = 4 },
            @{ name = "Arlen";                   playerNumber = 5 }
        )
    },
    @{
        name = "Nasgor Critical"; gameType = "Mobile Legends"
        players = @(
            @{ name = "Muhammad Fadhil Al Habib"; playerNumber = 1 },
            @{ name = "Fauzan Ammae Daffa";       playerNumber = 2 },
            @{ name = "Muhammad Hilmi Azmi";      playerNumber = 3 },
            @{ name = "Muhammad Zaid Al Fath";    playerNumber = 4 },
            @{ name = "Wahyu Abdillah Nasution";  playerNumber = 5 }
        )
    },
    @{
        name = "Sneaky Golem"; gameType = "Mobile Legends"
        players = @(
            @{ name = "Joshua Evan Wilson";            playerNumber = 1 },
            @{ name = "Kenneth Riadi Nugroho";         playerNumber = 2 },
            @{ name = "Christopher Bertrand";          playerNumber = 3 },
            @{ name = "Tantokusumo Vincentio Reynard"; playerNumber = 4 },
            @{ name = "Joshia Owen Wilson";            playerNumber = 5 }
        )
    }
)

$created = 0; $failed = 0
foreach ($team in $teams) {
    $body = @{ name = $team.name; gameType = $team.gameType; players = $team.players } | ConvertTo-Json -Depth 4
    try {
        $resp = Invoke-RestMethod -Uri "$ApiBase/api/teams" -Method POST -Headers $headers -Body $body
        Write-Host "  [OK] $($team.gameType) · $($team.name) ($($team.players.Count) players) → id $($resp.id)" -ForegroundColor Green
        $created++
    } catch {
        Write-Host "  [FAIL] $($team.gameType) · $($team.name): $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "Done. Created: $created  Failed: $failed" -ForegroundColor Cyan
