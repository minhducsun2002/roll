using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Roll.Entities
{
    public class HideRecord : BsonDocument
    {
        [BsonId]
        public ObjectId Id { get; set; }
        
        [BsonElement("name")]
        public string Name { get; set; }
        
        [BsonElement("prefix")]
        public int Prefix { get; set; }
        
        [BsonElement("suffix")]
        public int Suffix { get; set; }
    }
}