import {v4 as uuid, validate} from "uuid";
import { userCollection } from "./collection/userCollection";

/**
 * - Generates access token
 * @returns 
 */
export function generateToken() {
  return uuid();
}

/**
 * - Validates given token and get it's user 
 * @param token 
 * @returns 
 */
export async function getUserByToken(token: string) {
  if (!validate(token)) {
    throw "Invalid auth token.";
  }

  const user = await userCollection.findOne({
    "tokens.token": token
  });

  if (!user) {
    throw "Invalid auth token.";
  }

  return user;
}