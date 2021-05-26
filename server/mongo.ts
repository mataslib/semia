import { getDb, getClient } from "./db";
import { v4 as uuid } from "uuid";
import mongodb from 'mongodb'

const dbClient = await getClient();
const db = await getDb();

const roomCollection = db.collection('room');
const userCollection = db.collection('user');

const result = await roomCollection.findOne({_id: new mongodb.ObjectId("609e8afb37dbf13f53fe8fa7")});
console.log("ahoj");
