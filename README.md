- Set `MONGODB_CONNECTION_STRING` to a MongoDB URI to your database.
- The database name is called `roll`.
- The credentials collection is `_user`.
  Documents in it must contain at least two fields of type string, `username` and `password` (no hashing).
- The collection containing metadata regarding hiding roll columns is `_hide`.
  Documents in it must contain at least 3 fields, `name` of type string, and `prefix`/`suffix` of type int (32-bit integer).
