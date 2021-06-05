
import { Socket } from "socket.io";
import { getUserByToken } from "../accessToken";
import * as types from "../types";

/**
 * Authenticates a user and attaches it's object to a socket
 *
 * @param socket 
 * @param next 
 * @returns 
 */
export const userAuthMiddleware = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake?.auth?.token;
    if (!token) {
      return next(new Error("Auth token missing."));
    }
  
    const user = await getUserByToken(token);
    if (!user) {
      return next(new Error("Invalid auth token."));
    }
  
    (socket as UserSocket).user  = user;
    return next();
  } catch (err) {
    return next(new Error(err));
  }
};

export interface UserSocket extends Socket {
  user: types.User
}

/**
 * Whether socket has attached user object or not
 *
 * @param socket 
 * @returns 
 */
export function isUserSocket(socket: Socket): socket is UserSocket {
  return 'user' in socket;
}