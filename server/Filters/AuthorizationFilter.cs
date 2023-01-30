using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc.Filters;
using MongoDB.Driver;
using Roll.Entities;

namespace Roll.Filters
{
    public class AuthorizationFilterAttribute : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var http = context.HttpContext;
            var headers = http.Request.Headers;
            var auth = headers.Authorization;
            if (auth.Count == 0)
            {
                http.Response.StatusCode = (int) HttpStatusCode.Unauthorized;
                return;
            }

            var s = auth.First()!;
            var pieces = s.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
            if (pieces.Length < 2)
            {
                http.Response.StatusCode = (int) HttpStatusCode.Unauthorized;
                return;
            }

            var p = pieces.Take(2)
                .Select(Convert.FromBase64String)
                .Select(Encoding.UTF8.GetString)
                .ToArray();
            string username = p[0], password = p[1];

            var match = await context.HttpContext.RequestServices.GetRequiredService<IMongoClient>()
                .GetDatabase(Global.DbName)
                .GetCollection<User>(Global.UserCollection)
                .CountDocumentsAsync(Builders<User>.Filter.And(
                    Builders<User>.Filter.Eq("username", username),
                    Builders<User>.Filter.Eq("password", password)
                ));

            if (match == 1)
            {
                await next();
            }
            else
            {
                http.Response.StatusCode = (int) HttpStatusCode.Unauthorized;
            }
        }
    }
}