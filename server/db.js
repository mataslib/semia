import mongodb from 'mongodb';
const { MongoClient } = mongodb;
const url = 'mongodb://root:root@mongo:27017';
const dbname = 'semia';
// Use connect method to connect to the server
let _db;
export async function getDb() {
    if (_db) {
        return Promise.resolve(_db);
    }
    const client = await getClient();
    return client.db(dbname);
}
let _client;
export async function getClient() {
    if (_client) {
        return Promise.resolve(_client);
    }
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, client) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUE7QUFDN0IsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQTtBQUUvQixNQUFNLEdBQUcsR0FBRyxpQ0FBaUMsQ0FBQztBQUM5QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFFdkIsOENBQThDO0FBQzlDLElBQUksR0FBZSxDQUFDO0FBQ3BCLE1BQU0sQ0FBQyxLQUFLLFVBQVUsS0FBSztJQUN6QixJQUFJLEdBQUcsRUFBRTtRQUNQLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM3QjtJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sU0FBUyxFQUFFLENBQUM7SUFDakMsT0FBTyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFFRCxJQUFJLE9BQTRCLENBQUM7QUFDakMsTUFBTSxDQUFDLEtBQUssVUFBVSxTQUFTO0lBRTdCLElBQUksT0FBTyxFQUFFO1FBQ1gsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2pDO0lBRUQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFVLEdBQUcsRUFBRSxNQUFNO1lBQzVDLElBQUksR0FBRyxFQUFFO2dCQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDWixPQUFPO2FBQ1I7WUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbEMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMifQ==