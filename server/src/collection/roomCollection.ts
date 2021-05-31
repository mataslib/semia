import { getDb } from "../db";
import * as types from "../types";

const db = await getDb();
export const roomCollection = db.collection<types.Room>('room');