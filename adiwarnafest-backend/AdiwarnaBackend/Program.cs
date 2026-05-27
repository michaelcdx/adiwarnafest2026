using AdiwarnaBackend.Data;
using AdiwarnaBackend.Data.Seed;
using AdiwarnaBackend.Services;
using AdiwarnaBackend.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using System.Threading.RateLimiting;
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#"))
            continue;

        var parts = line.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var value = parts[1].Trim();
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost", "https://gadpa.live", "https://www.gadpa.live")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var tokenSecret = builder.Configuration["AppSettings:Token"];
var tokenIssuer = builder.Configuration["AppSettings:Issuer"];
var tokenAudience = builder.Configuration["AppSettings:Audience"];

if (string.IsNullOrWhiteSpace(tokenSecret) || tokenSecret == "CHANGE_ME")
    throw new InvalidOperationException("AppSettings:Token is missing or not set.");

if (string.IsNullOrWhiteSpace(tokenIssuer))
    throw new InvalidOperationException("AppSettings:Issuer is missing.");

if (string.IsNullOrWhiteSpace(tokenAudience))
    throw new InvalidOperationException("AppSettings:Audience is missing.");

builder.Services.AddDbContext<AdiwarnaDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("AdiwarnaDatabase"),
        npgsql => npgsql.CommandTimeout(30))
    .ConfigureWarnings(w => w
        .Ignore(RelationalEventId.PendingModelChangesWarning)
        .Default(WarningBehavior.Log)));

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("auth", limiterOptions =>
    {
        limiterOptions.PermitLimit = 10;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!)),
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .AddRequirements(new NotDisabledRequirement())
        .Build();
});

builder.Services.AddScoped<IAuthorizationHandler, NotDisabledHandler>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<ILuckyDrawService, LuckyDrawService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AdiwarnaDbContext>();
    await dbContext.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(dbContext);
}

app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors("DevCors");

// app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseWhen(context => context.Request.Path == "/", handler =>
{
    handler.Use(async (context, next) =>
    {
        context.Response.Redirect("/scalar/v1");
        await next();
    });
});

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
