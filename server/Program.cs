using MongoDB.Driver;
using OfficeOpenXml;

ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
var mongodbUri = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddNewtonsoftJson();
builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongodbUri ?? "mongodb://localhost:27017"));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();


static class Global
{
    public const string DbName = "roll";
    public const string UserCollection = "_user";
    public const string HideDataCollection = "_hide";
}