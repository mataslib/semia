// socket with authenticated user

import { isUserSocket, userAuthMiddleware } from "../middleware/userAuth";
import { emptyFn, withErrorCatch } from "../utils";
import * as types from "../types";
import { Server } from "socket.io";
import { roomCollection } from "../collection/roomCollection";

export function initSocket(params: { io: Server }) {
  const { io } = params;

  const userSocket = io.of("/user");
  userSocket.use(userAuthMiddleware);

  userSocket.on("connect", (socket: any) => {
    if (!isUserSocket(socket)) {
      throw "Socket is not User socket! Use user auth middleware.";
    }

    /**
     * - Returns list of rooms
     */
    socket.on('room:list', async (message, sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, async () => {
        const roomListReq = types.roomListReqSchema.validateSync(message);
        const rooms = await roomCollection.find({ "users.userId": socket.user._id }).toArray();
        const response: types.RoomListResponse = { result: rooms };
        return sendResponse(response);
      });
    });

    /**
     * - Creates a new room
     */
    socket.on('room:create', async (message, sendResponse) => {
      withErrorCatch(sendResponse, async () => {
        const roomCreateReq = types.roomCreateReqSchema.validateSync(message);

        const roomUser: types.RoomUser = {
          userId: socket.user._id,
          email: socket.user.email,
          role: 'author',
        }
        const room: types.Room = {
          name: roomCreateReq.name,
          users: [roomUser],
          messages: [],
        }
        const result = await roomCollection.insertOne(room);
        const created = result.ops[0];

        const newRoomMessage: types.NewRoomMessage = {
          room: created
        }
        socket.emit('room:new', newRoomMessage);

        const response: types.RoomCreateResponse = {
          result: true
        }
        return sendResponse(response);
      });
    });
  });
}

