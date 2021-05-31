// Authorizes user and attaches it's object to socket

import mongodb from "mongodb";
import { Socket } from "socket.io";
import { userCollection } from "../collection/userCollection";
import * as types from "../types";

export const userAuthMiddleware = async (socket: Socket, next: Function) => {
  const token = socket.handshake?.auth?.token;
  if (token === undefined) {
    return next(new Error("Auth token missing."));
  }

  const user = await validateToken(socket.handshake.auth.token);
  if (!user) {
    return next(new Error("Invalid auth token."));
  }

  (socket as UserSocket).user  = user;
  return next();
};

function validateToken(token: string) {
  const user = userCollection.findOne({
    "tokens.token": new mongodb.ObjectID(token)
  });

  return user;
}

export interface UserSocket extends Socket {
  user: types.User
}

export function isUserSocket(socket: Socket): socket is UserSocket {
  return 'user' in socket;
}