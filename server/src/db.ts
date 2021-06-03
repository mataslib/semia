import mongodb from 'mongodb'
import { dbconnectionstring, dbname } from './globals';
const { MongoClient } = mongodb


// Use connect method to connect to the server
let _db: mongodb.Db;
export async function getDb(): Promise<mongodb.Db> {
  if (_db) {
    return Promise.resolve(_db);
  }

  const client = await getClient();
  return client.db(dbname);
}

let _client: mongodb.MongoClient;
export async function getClient(): Promise<mongodb.MongoClient>
{
  if (_client) {
    return Promise.resolve(_client);
  }

  return new Promise((resolve, reject) => {
    MongoClient.connect(dbconnectionstring, function (err, client) {
      if (err) {
        console.debug(err);
        reject(err);
        return;
      }

      console.debug('Mongo connected!');
      _client = client;
      resolve(_client);
    });
  });
}