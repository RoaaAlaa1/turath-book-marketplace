using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using TurathApi.Data;
using TurathApi.Models;
using TurathApi.Models.Enums;
using TurathApi.Services;
using TurathApi.Services.Implementations;
using TurathApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity Configuration (Hardened Security Defaults)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Application Business Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ChatbotToolService>();

// JWT Authentication Service Setup
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Must be false in local development to prevent 401 errors when running on HTTP
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Controllers & JSON Formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Swagger & OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Turath Book Marketplace API",
        Version = "v1",
        Description = "REST API for the Turath book marketplace."
    });

    // Configure JWT Bearer Authorization in Swagger UI
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste raw JWT token here (Bearer prefix will be added automatically)"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS Configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

// Chatbot
builder.Services.AddHttpClient<ChatbotService>();



var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        var db = services.GetRequiredService<AppDbContext>();
        db.Database.Migrate();

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roles = { "Admin", "Seller", "Customer" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        string adminEmail = "admin@turath.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            var user = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                FirstName = "Turath",
                LastName = "Admin"
            };

            var result = await userManager.CreateAsync(user, "Admin@12345");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "Admin");
            }
        }

        if (!await db.Categories.AnyAsync())
        {
            var categories = new[]
            {
                new Category { Name = "Fiction", Description = "Narrative and literary fiction." },
                new Category { Name = "Science & Technology", Description = "Technology, science, and innovation." },
                new Category { Name = "Children's Books", Description = "Books for children and young readers." },
                new Category { Name = "History", Description = "Historical nonfiction and world history." }
            };

            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();
        }

        string sellerEmail = "seller@turath.com";
        var sellerUser = await userManager.FindByEmailAsync(sellerEmail);
        if (sellerUser == null)
        {
            sellerUser = new ApplicationUser
            {
                UserName = sellerEmail,
                Email = sellerEmail,
                EmailConfirmed = true,
                FirstName = "Turath",
                LastName = "Seller"
            };

            var sellerResult = await userManager.CreateAsync(sellerUser, "Seller@12345");
            if (sellerResult.Succeeded)
            {
                await userManager.AddToRoleAsync(sellerUser, "Seller");
            }
        }

        if (!await db.Books.AnyAsync())
        {
            var categoryMap = await db.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);
            var sampleBooks = new[]
            {
                new Book
                {
                    Title = "The Alchemist",
                    Author = "Paulo Coelho",
                    Description = "A journey of purpose, courage, and self-discovery.",
                    Price = 90m,
                    Quantity = 12,
                    CategoryId = categoryMap["Fiction"],
                    SellerId = sellerUser.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
                    Condition = BookCondition.Good,
                    AgeRating = "13+",
                    ApprovalStatus = ApprovalStatus.Approved
                },
                new Book
                {
                    Title = "A Brief History of Time",
                    Author = "Stephen Hawking",
                    Description = "A readable exploration of time, space, and the universe.",
                    Price = 120m,
                    Quantity = 8,
                    CategoryId = categoryMap["Science & Technology"],
                    SellerId = sellerUser.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
                    Condition = BookCondition.LikeNew,
                    AgeRating = "12+",
                    ApprovalStatus = ApprovalStatus.Approved
                },
                new Book
                {
                    Title = "The Little Prince",
                    Author = "Antoine de Saint-Exupéry",
                    Description = "A timeless classic about childhood, imagination, and friendship.",
                    Price = 75m,
                    Quantity = 15,
                    CategoryId = categoryMap["Children's Books"],
                    SellerId = sellerUser.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
                    Condition = BookCondition.Good,
                    AgeRating = "All Ages",
                    ApprovalStatus = ApprovalStatus.Approved
                },
                new Book
                {
                    Title = "The Story of the World",
                    Author = "Susan Wise Bauer",
                    Description = "A lively survey of world history from early civilizations to modern times.",
                    Price = 110m,
                    Quantity = 9,
                    CategoryId = categoryMap["History"],
                    SellerId = sellerUser.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
                    Condition = BookCondition.Acceptable,
                    AgeRating = "All Ages",
                    ApprovalStatus = ApprovalStatus.Approved
                }
            };

            db.Books.AddRange(sampleBooks);
            await db.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating and seeding the database.");
    }
}

// HTTP Request Pipeline Order
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Turath API v1");
        options.RoutePrefix = string.Empty;
    });
}

if (app.Urls.Any(url => url.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");

// Auth Middleware Pipeline Order
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();