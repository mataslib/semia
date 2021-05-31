import { getDb } from "../db";
import * as types from "../types";

const db = await getDb();
export const userCollection = db.collection<types.User>('user');