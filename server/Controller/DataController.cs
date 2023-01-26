using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Roll.Controller
{
    [ApiController]
    [Route("/data")]
    public class DataController : Microsoft.AspNetCore.Mvc.Controller
    {
        private readonly IMongoClient client;

        private readonly JsonWriterSettings jsonWriterSettings = new() { OutputMode = JsonOutputMode.RelaxedExtendedJson };
        public DataController(IMongoClient client) => this.client = client;
        public IMongoDatabase Database => client.GetDatabase(Global.DbName);

        [HttpGet]
        [Route("tables")]
        public async Task<ActionResult<List<string>>> ListTables()
        {
            return await (await Database.ListCollectionNamesAsync()).ToListAsync();
        }
        
        [HttpPost]
        [Route("table")]
        public async Task<IActionResult> CreateTable([FromBody] string tableName)
        {
            await Database.CreateCollectionAsync(tableName.ToLowerInvariant());
            return Ok();
        }
        
        [HttpPost]
        [Route("table/{tableName}")]
        public async Task<ActionResult<string>> Create(string tableName, [FromBody] JObject obj)
        {
            if (!await IsCollectionThere(tableName))
            {
                return NotFound();
            }

            var json = obj.ToString(Formatting.None);
            var doc = BsonSerializer.Deserialize<BsonDocument>(json);
            await Database.GetCollection<BsonDocument>(tableName).InsertOneAsync(doc);
            return doc.ToJson(jsonWriterSettings);
        }

        [HttpGet]
        [Route("table/{tableName}")]
        public async Task<ActionResult<string>> List(string tableName)
        {
            if (!await IsCollectionThere(tableName))
            {
                return NotFound();
            }

            var docs = await Database.GetCollection<BsonDocument>(tableName).Find(doc => true)
                .ToListAsync();
            var arr = new BsonArray(docs);
            return Ok(arr.ToJson(jsonWriterSettings));
        }
        
        [HttpGet]
        [Route("table/{tableName}/{id}")]
        public async Task<ActionResult<string>> Get(string tableName, string id)
        {
            if (!await IsCollectionThere(tableName))
            {
                return NotFound();
            }

            var docs = await Database.GetCollection<BsonDocument>(tableName)
                .Find(Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id)))
                .FirstOrDefaultAsync();
            if (docs == null) return NotFound();
            return Ok(docs.ToJson(jsonWriterSettings));
        }
        
        [HttpPut]
        [Route("table/{tableName}/{id}")]
        public async Task<ActionResult<string>> Put(string tableName, string id, [FromBody] JObject obj)
        {
            if (!await IsCollectionThere(tableName))
            {
                return NotFound();
            }

            var collection = Database.GetCollection<BsonDocument>(tableName);
            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));

            var json = obj.ToString(Formatting.None);
            var newDoc = BsonSerializer.Deserialize<BsonDocument>(json);
            newDoc["_id"] = ObjectId.Parse(id);

            var res = await collection.ReplaceOneAsync(filter, newDoc, new ReplaceOptions
            {
                IsUpsert = false
            });
            if (res.IsAcknowledged)
            {
                return Ok(newDoc.ToJson(jsonWriterSettings));
            }

            return BadRequest(res.ToJson());
        }
        
        [HttpDelete]
        [Route("table/{tableName}/{id}")]
        public async Task<ActionResult<string>> Delete(string tableName, string id)
        {
            if (!await IsCollectionThere(tableName))
            {
                return NotFound();
            }

            var collection = Database.GetCollection<BsonDocument>(tableName);
            var filter = Builders<BsonDocument>.Filter.Eq("_id", ObjectId.Parse(id));
            var res = await collection.DeleteOneAsync(filter);
            if (res.IsAcknowledged)
            {
                return Ok(res.ToJson());
            }

            return BadRequest(res.ToJson());
        }

        private async Task<bool> IsCollectionThere(string tableName)
        {
            var names = await (await Database.ListCollectionNamesAsync()).ToListAsync();
            return names.Contains(tableName.ToLowerInvariant(), StringComparer.InvariantCultureIgnoreCase);
        }
    }
}