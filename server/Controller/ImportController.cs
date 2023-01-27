using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using OfficeOpenXml;

namespace Roll.Controller
{
    [ApiController]
    [Route("/import")]
    public class ImportController : Microsoft.AspNetCore.Mvc.Controller
    {
        private readonly IMongoClient client;

        private readonly JsonWriterSettings jsonWriterSettings = new() { OutputMode = JsonOutputMode.RelaxedExtendedJson };
        public ImportController(IMongoClient client) => this.client = client;
        public IMongoDatabase Database => client.GetDatabase(Global.DbName);

        private const int ColumnMax = 100;

        [Route("xlsx/{tableName}")]
        [HttpPost]
        public async Task<IActionResult> Import([FromForm(Name = "file")]IFormFile file, string tableName)
        {
            if (await IsCollectionThere(tableName))
            {
                return Conflict("table already exists");
            }
            
            await using var r = file.OpenReadStream();
            using var memstream = new MemoryStream();
            await r.CopyToAsync(memstream);
            var package = new ExcelPackage(memstream);
            var workbook = package.Workbook;
            if (workbook.Worksheets.Count < 1)
                return BadRequest("no worksheet!");
            var sheet = workbook.Worksheets[0];
            var columnIndices = new List<(int, string)>();
            var columnCount = Math.Min(ColumnMax, sheet.Dimension.Columns);
            var rowCount = sheet.Dimension.Rows;
            for (var column = 1; column <= columnCount; column++)
            {
                const int row = 1;
                var value = sheet.Cells[row, column].Value;
                if (value is string s)
                {
                    columnIndices.Add((column, s));
                }
            }

            var newDocs = new List<BsonDocument>();
            for (var row = 2; row <= rowCount; row++)
            {
                var doc = new BsonDocument();
                foreach (var (colIndex, colName) in columnIndices)
                {
                    var value = (sheet.Cells[row, colIndex].Value) ?? (object) "";
                    doc[colName] = value.ToString();
                }
                
                newDocs.Add(doc);
            }

            try
            {
                await Database.CreateCollectionAsync(tableName.ToLowerInvariant());
            }
            catch
            {
                // ignored
                await Database.GetCollection<BsonDocument>(tableName).DeleteManyAsync(FilterDefinition<BsonDocument>.Empty);
            }
            
            await Database.GetCollection<BsonDocument>(tableName).InsertManyAsync(newDocs);
            
            return Ok();
        }
        
        private async Task<bool> IsCollectionThere(string tableName)
        {
            var names = await (await Database.ListCollectionNamesAsync()).ToListAsync();
            return names.Contains(tableName.ToLowerInvariant(), StringComparer.InvariantCultureIgnoreCase);
        }
    }
}