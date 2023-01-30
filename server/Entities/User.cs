using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Roll.Entities
{
    public class User : BsonDocument
    {
        [BsonId]
        public ObjectId Id { get; set; }
        
        [BsonElement("username")]
        public string Username { get; set; }
        
        [BsonElement("password")]
        public string Password { get; set; }
    }
}