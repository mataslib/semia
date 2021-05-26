import * as http from "http";
import * as url from 'url';
import * as fs from 'fs';
import * as yup from 'yup';
// import { server as WebSocketServer } from "websocket";
import { Server, Socket } from "socket.io";
import { getDb, getClient } from "./db";
import { v4 as uuid } from "uuid";
import * as types from "semiatypes";
import mongodb from 'mongodb'

const dbClient = await getClient();
const db = await getDb();

function isYupValidationError(error: any): error is yup.ValidationError {
  const isYupValidationError = typeof error === "object"
    && (
      error instanceof yup.ValidationError
      || error.constructor.name === "ValidationError"
    )

  return isYupValidationError;
}

const roomCollection = db.collection<types.Room>('room');
const userCollection = db.collection<types.User>('user');

const port = 8086;

// Create http server
const httpServer = http.createServer((req, res) => {
  const baseurl = 'http://' + req.headers.host + '/';
  const url = new URL(req.url, baseurl);

  // serve file by url path, or index.html as default 
  const filename = url.pathname === '/'
    ? './index.html'
    : `.${url.pathname}`;

  fs.readFile(filename, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end("404 Not Found");
    }

    res.writeHead(200);
    res.write(data);
    return res.end();
  });
});

// Create websocket server
// const wsserver = new WebSocketServer({
//   httpServer: httpserver
// });

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: "*"
  }
});

const emptyFn = () => {};

const anonymSocket = io.of("/");
anonymSocket.on("connection", (socket) => {
  socket.on('authentication', async (message, sendResponse = emptyFn) => {
    try {
      const userAuthReq = types.userAuthReqSchema.validateSync(message);
      let user = await userCollection.findOne({ email: userAuthReq.email });
      if (!user) {
        throw `Neexistující email.`;
      }
      if (user.password !== userAuthReq.password) {
        throw `Nesprávné heslo.`;
      }

      const token = new mongodb.ObjectID();
      let result = await userCollection.updateOne(user, {
        $push: {
          tokens: {
            token: token
          }
        }
      });

      const response: types.AuthResponse = {
        result: { token: token.toString() }
      }

      return sendResponse(response);
    } catch (error) {
      message = typeof error === "string" ? error : "error";
      if (error instanceof yup.ValidationError) {
        message = error.message;
      }
      const response: types.AuthResponse = {
        error: {
          message
        }
      }
      return sendResponse(response);
    }
  });

  socket.on('user:register', async (message, sendResponse) => {
    try {
      const userRegisterReq = types.userRegisterReqSchema.validateSync(message);
      const user: types.User = {
        email: userRegisterReq.email,
        password: userRegisterReq.password,
        tokens: [],
      }
      const result = await userCollection.insertOne(user);
      // const created = result.ops[0];
      const response: types.UserRegisterResponse = {
        result: true
      }
      return sendResponse(response);
    } catch (error) {
      let message;

      if (error instanceof yup.ValidationError) {
        message = error.message;
      } else {
        message = "Problém s databází";
      }

      return sendResponse({
        error: {
          message
        }
      });
    }
  });
});


function validateToken(token: string) {
  const user = userCollection.findOne({
    "tokens.token": new mongodb.ObjectID(token)
  });

  return user;
}

const userSocket = io.of("/user");

const userAuthMiddleware = async (socket: Socket, next: Function) => {
  const token = socket.handshake?.auth?.token;
  if (token === undefined) {
    return next(new Error("Auth token missing."));
  }

  const user = await validateToken(socket.handshake.auth.token);
  if (!user) {
    return next(new Error("Invalid auth token."));
  }

  socket.user = user;
  return next();
};

interface UserSocket extends Socket {
  user: types.User
}
function isUserSocket(socket: Socket): socket is UserSocket {
  return 'user' in socket; 
}

userSocket.use(userAuthMiddleware);
userSocket.on("connect", (socket: any) => {
  if (!isUserSocket(socket)) {
    throw "Socket is not User socket";
  }

  socket.on('room:list', async (message, sendResponse) => {
    try {
      const roomListReq = types.roomListReqSchema.validateSync(message);
      const rooms = await roomCollection.find({ "users.userId": socket.user._id }).toArray();
      const response: types.RoomListResponse = { result: rooms };
      return sendResponse(response);
    } catch (error) {
      let message;
      if (error instanceof yup.ValidationError) {
        message = error.message;
      } else {
        message = `Problém s databází.`;
      }

      const response: types.ErrorResponse = {
        error: {
          message
        }
      }
      return sendResponse(response);
    }
  });
  
  socket.on('room:create', async (message, sendResponse) => {
    try {
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
    } catch (error) {
      let message;
      if (error instanceof yup.ValidationError) {
        message = error.message;
      } else {
        message = `Problém s databází.`;
      }

      return sendResponse({
        error: {
          message
        }
      });
    }
  });

});

const roomSocket = io.of(/^\/room-[\w\d]+$/);
// todo: kdyz error v client appce nezobrazit room stranku
const roomUserAuthMiddleware = async (socket: Socket, next: Function) => {
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

  socket.room = room;
  return next();
}

roomSocket.use(userAuthMiddleware);
roomSocket.use(roomUserAuthMiddleware);
interface RoomSocket extends Socket, UserSocket {
  room: types.Room
}
function isRoomSocket(socket: Socket): socket is RoomSocket {
  return isUserSocket(socket) && 'room' in socket; 
}
roomSocket.on("connect", (socket) => {
  if (!isRoomSocket(socket)) {
    throw "Socket is not Room socket!";
  }

  socket.on('room:joinMeeting', (message, sendResponse) => {
    try {
      const joinMeetingReq = types.joinRoomMeetingReqSchema.validateSync(message);
      // poslete nabidky pred pripojenim noveho do mistnosti
      // jinak by si poslal novy nabidku sam sobe
      const socketRoomId = `room${socket.room._id}`;
      socket.to(socketRoomId).emit(`wrtc:send-offer`, { to: socket.id });
      socket.join(socketRoomId);
      const response: types.RoomJoinMeetingResponse = {
        result: true
      };
      return sendResponse(response);
    } catch (error) {
      message = typeof error === "string" ? error : "error";
      if (error instanceof yup.ValidationError) {
        message = error.message;
      }

      return sendResponse({
        error: {
          message
        }
      });
    }
  });

  socket.on('room:leaveMeeting', (message, sendResponse = emptyFn) => {
    try {
      const leaveMeetingReq = types.leaveRoomMeetingReqSchema.validateSync(message);
      // poslete nabidky pred pripojenim noveho do mistnosti
      // jinak by si poslal novy nabidku sam sobe
      const socketRoomId = `room${socket.room._id}`;
      socket.leave(socketRoomId);
      const response: types.RoomLeaveMeetingResponse = {
        result: true
      };
      return sendResponse(response);
    } catch (error) {
      message = typeof error === "string" ? error : "error";
      if (error instanceof yup.ValidationError) {
        message = error.message;
      }

      return sendResponse({
        error: {
          message
        }
      });
    }
  });



  socket.on('room:messages', async (sendResponse) => {
    try {
      const room = await roomCollection.findOne({
        _id: socket.room._id,
      });
  
      const response: types.RoomMessagesResponse = {
        result:
          room?.messages ?? []
      }; 
      sendResponse(response);
    } catch (error) {
      const response: types.RoomMessagesResponse = {
        error: {
          message: "chyba"
        }
      }
      sendResponse(response);
    }
  });

  socket.on('room:createMessage', async (message, sendResponse) => {
    try {
      const createMessageReq = types.roomCreateMessageReqSchema.validateSync(message);
      const user = socket.user;

      let fileMessage = {};
      if (createMessageReq.file) {
        const filepath = `uploads/${uuid()}.${createMessageReq.file.extension}`;
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
    } catch (error) {
      let message;
      if (isYupValidationError(error)) {
        message = error.message;
      } else {
        message = `Problém s databází.`;
      }

      return sendResponse({
        error: {
          message
        }
      });
    }
  });

  socket.on('room:memberList', async (sendResponse) => {
    try {
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
    } catch (error) {
      // todo
    }
  });

  socket.on('room:inviteMember', async (message, sendResponse = () => {}) => {
    try {
      const inviteMessage = types.roomInviteMemberReqSchema.validateSync(message);
      let existingMember = await roomCollection.findOne({
        "_id": socket.room._id,
        "users.email": inviteMessage.email
      });
      if (existingMember) {
        throw "User is already a member.";
      } 
      
      const invitedUser = await userCollection.findOne({email: inviteMessage.email});
      if (!invitedUser) {
        throw "User does not exist.";
      }

      const newRoomUser: types.RoomUser =  {
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
    } catch (error) {
      console.log('todo');
      
      // todo
    }
  });

  // client chce, abych preposlal offer
  socket.on('wrtc:send-offer', (message) => {
    console.debug(`wrtc:send-offer`);
    socket.to(message.to).emit('wrtc:receive-offer', { ...message, from: socket.id });
  });

  // client chce, abych preposlal offer
  socket.on('wrtc:signal', (message) => {
    console.debug(`wrtc:signal`, message.description, message.candidate, message.from, message.to);
    socket.to(message.to).emit('wrtc:signal', { ...message, from: socket.id });
  });

  // client chce, abych preposlal odpoved
  socket.on('wrtc:send-answer', (message) => {
    console.debug(`wrtc:send-answer`);
    socket.to(message.to).emit('wrtc:receive-answer', { ...message, from: socket.id });
  });

  socket.on("wrtc:send-ice-candidate", (message) => {
    console.debug(`wrtc:send-ice-candidate`);
    const toRole = getOpositeWrtcRole(message.role);
    socket
      .to(message.to)
      .emit(
        `wrtc:${toRole}:receive-ice-candidate`,
        { ...message, from: socket.id }
      );
  });
});

function getOpositeWrtcRole(role: "offeror" | "answerer") {
  const mapping = {
    offeror: "answerer",
    answerer: "offeror",
  };

  const result = mapping[role];

  return result;
}

httpServer.listen(port);
console.log(`Server listening on port ${port}. Go to http://localhost:${port}.`);
