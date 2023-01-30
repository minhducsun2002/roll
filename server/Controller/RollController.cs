using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using Roll.Filters;

namespace Roll.Controller
{
    [ApiController]
    [Route("/roll")]
    [AuthorizationFilter]
    public class RollController : Microsoft.AspNetCore.Mvc.Controller
    {
        private readonly IMongoClient client;
        private const string CountKey = "__count";

        private readonly JsonWriterSettings jsonWriterSettings = new() { OutputMode = JsonOutputMode.RelaxedExtendedJson };
        public RollController(IMongoClient client) => this.client = client;
        public IMongoDatabase Database => client.GetDatabase(Global.DbName);

        [HttpPost]
        [Route("/{tableName}/{count:int}")]
        public async Task<ActionResult<string>> Roll(string tableName, int count)
        {
            if (!await IsCollectionThere(tableName))
            {
                return NotFound();
            }

            await Database.GetCollection<BsonDocument>(tableName).UpdateManyAsync(
                FilterDefinition<BsonDocument>.Empty,
                new JsonUpdateDefinition<BsonDocument>($"{{ $set: {{ \"{CountKey}\" : 0 }} }}")
            );

            for (var i = 1; i <= count; i++)
            {
                var record = await Database.GetCollection<BsonDocument>(tableName).UpdateOneAsync(
                    new FilterDefinitionBuilder<BsonDocument>().Not(
                        new FilterDefinitionBuilder<BsonDocument>()
                            .Eq(CountKey, 0)
                    ),
                    Builders<BsonDocument>.Update.Set(CountKey, i)
                );
            }

            var final = await Database.GetCollection<BsonDocument>(tableName).FindAsync(
                new FilterDefinitionBuilder<BsonDocument>().Not(
                    new FilterDefinitionBuilder<BsonDocument>()
                        .Eq(CountKey, 0)
                )
            );

            var list = await final.ToListAsync();
            return Ok(list.ToJson(jsonWriterSettings));
        }
        
        private async Task<bool> IsCollectionThere(string tableName)
        {
            var names = await (await Database.ListCollectionNamesAsync()).ToListAsync();
            return names.Contains(tableName.ToLowerInvariant(), StringComparer.InvariantCultureIgnoreCase);
        }
    }
}