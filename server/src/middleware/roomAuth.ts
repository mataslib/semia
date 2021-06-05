import mongodb from "mongodb";
import { Socket } from "socket.io";
import { roomCollection } from "../collection/roomCollection";
import { isUserSocket, UserSocket } from "./userAuth";
import * as types from "../types";

/**
 * Authenticates a user as a member of a room and attaches a room object to a socket
 * 
 * @param socket 
 * @param next 
 * @returns 
 */
export const roomUserAuthMiddleware = async (socket: Socket, next: Function) => {
  try {
    // User must be authorized as App user first
    if (!isUserSocket(socket)) {
      throw "User object must be attached to socket first. Try use User auth middleware first.";
    }

    const roomId = socket.nsp.name.split('-')[1];

    // check if socket.user is member of room
    const room = await roomCollection.findOne({
      _id: new mongodb.ObjectID(roomId),
    });

    if (!room) {
      return next(new Error(`Room does not exist.`));
    }

    const roomUser = room.users.find(roomUser => {
      return roomUser.userId.equals(socket.user._id);
    });
    if (!roomUser) {
      return next(new Error(`You are not member of this room.`));
    }

    (socket as RoomSocket).room = room;
    return next();
  } catch (err) {
    return next(new Error(err));
  }
}

export interface RoomSocket extends Socket, UserSocket {
  room: types.Room
}

/**
 * Whether socket has attached user and room object or not.
 *
 * @param socket 
 * @returns 
 */
export function isRoomSocket(socket: Socket): socket is RoomSocket {
  return isUserSocket(socket) && 'room' in socket;
}