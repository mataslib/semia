// socket with authneticated user & member of room

import { Server, Socket } from "socket.io";
import { isRoomSocket, RoomSocket } from "../middleware/roomAuth";
import { userAuthMiddleware } from "../middleware/userAuth";
import { roomUserAuthMiddleware } from "../middleware/roomAuth";
import { emptyFn, withErrorCatch } from "../utils";
import * as fs from 'fs';
import { v4 as uuid } from "uuid";
import * as types from "../types";
import { roomCollection } from "../collection/roomCollection";
import mongodb from "mongodb";
import { userCollection } from "../collection/userCollection";

export function initSocket(params: { io: Server }) {
  const { io } = params;

  const roomSocket = io.of(/^\/room-[\w\d]+$/);
  roomSocket.use(userAuthMiddleware);
  roomSocket.use(roomUserAuthMiddleware);

  roomSocket.on("connect", (socket: Socket) => {
    if (!isRoomSocket(socket)) {
      throw "Socket is not Room socket! Use room auth middleware.";
    }

    socket.on('room:joinMeeting', (message, sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, () => {
        const joinMeetingReq = types.joinRoomMeetingReqSchema.validateSync(message);

        const socketRoomId = getSocketRoomId();
        const sendOfferMessage: types.WrtcSendOfferMessage = {
          to: socket.id, connectionId: uuid()
        }
        // Prompt room members to send offers to new member before joining him to socket room
        // otherwise he would also send offer to himself...
        socket.to(socketRoomId).emit(`wrtc:send-offer`, sendOfferMessage);

        socket.join(socketRoomId);
        const response: types.RoomJoinMeetingResponse = {
          result: true
        };
        return sendResponse(response);
      });
    });

    socket.on('room:leaveMeeting', (message, sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, () => {
        const leaveMeetingReq = types.leaveRoomMeetingReqSchema.validateSync(message);

        const socketRoomId = getSocketRoomId();
        socket.leave(socketRoomId);
        const response: types.RoomLeaveMeetingResponse = {
          result: true
        };
        return sendResponse(response);
      });
    });

    socket.on('room:messages', async (sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, async () => {
        const room = await roomCollection.findOne({
          _id: socket.room._id,
        });

        const response: types.RoomMessagesResponse = {
          result:
            room?.messages ?? []
        };
        sendResponse(response);
      });
    });

    socket.on('room:createMessage', async (message, sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, async () => {
        const createMessageReq = types.roomCreateMessageReqSchema.validateSync(message);
        const user = socket.user;

        let fileMessage = {};
        if (createMessageReq.file) {
          const filepath = `public/uploads/${uuid()}.${createMessageReq.file.extension}`;
          fs.writeFile(
            filepath,
            createMessageReq.file.data,
            'binary',
            (err) => {
              if (err) {
                throw err;
              }
            });
          fileMessage = {
            file: {
              path: filepath,
              name: createMessageReq.file.name
            }
          }
        }

        const newMessage: types.Message = {
          ...{
            _id: new mongodb.ObjectID(),
            message: createMessageReq.message,
            userName: user.email,
            userRef: user._id,
            createdAt: new Date(),
          }, ...fileMessage
        };

        await roomCollection.findOneAndUpdate({
          _id: socket.room._id
        }, {
          $push: {
            messages: newMessage
          }
        });
        const response: types.RoomCreateMessageRes = {
          result: true
        }
        sendResponse(response);

        const newMessageMessage: types.NewMessageMessage = {
          message: newMessage
        }
        roomSocket.emit("room:newMessage", newMessageMessage);
      });
    });

    socket.on('room:memberList', async (sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, async () => {
        const result = await roomCollection.findOne({
          _id: socket.room._id
        }, {
          projection: {
            users: 1
          }
        });
        const response: types.RoomListMembersResponse = {
          result: result?.users ?? []
        }
        sendResponse(response);
      });
    });

    socket.on('room:inviteMember', async (message, sendResponse = () => { }) => {
      withErrorCatch(sendResponse, async () => {
        const inviteMessage = types.roomInviteMemberReqSchema.validateSync(message);
        let existingMember = await roomCollection.findOne({
          "_id": socket.room._id,
          "users.email": inviteMessage.email
        });
        if (existingMember) {
          throw "User is already a member.";
        }

        const invitedUser = await userCollection.findOne({ email: inviteMessage.email });
        if (!invitedUser) {
          throw "User does not exist.";
        }

        const newRoomUser: types.RoomUser = {
          userId: invitedUser._id,
          email: invitedUser.email,
          role: 'user',
        };
        await roomCollection.findOneAndUpdate({
          _id: socket.room._id
        }, {
          $push: {
            users: newRoomUser
          }
        });

        const newMemberMessage: types.RoomNewMemberMessage = {
          user: newRoomUser
        };
        socket.emit('room:newMember', newMemberMessage);

        const response: types.RoomInviteMemberResult = {
          result: true
        };
        return sendResponse(response);
      });
    });

    socket.on('wrtc:signal', (message) => {
      socket.to(message.to).emit('wrtc:signal', { ...message, from: socket.id });
    });

    const getSocketRoomId = () => `room${socket.room._id}`;
  });
}

