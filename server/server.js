import * as http from "http";
import * as fs from 'fs';
import * as yup from 'yup';
// import { server as WebSocketServer } from "websocket";
import { Server } from "socket.io";
import { getDb, getClient } from "./db";
import { v4 as uuid } from "uuid";
import * as types from "semiatypes";
import mongodb from 'mongodb';
const dbClient = await getClient();
const db = await getDb();
function isYupValidationError(error) {
    const isYupValidationError = typeof error === "object"
        && (error instanceof yup.ValidationError
            || error.constructor.name === "ValidationError");
    return isYupValidationError;
}
const roomCollection = db.collection('room');
const userCollection = db.collection('user');
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
const emptyFn = () => { };
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
            const response = {
                result: { token: token.toString() }
            };
            return sendResponse(response);
        }
        catch (error) {
            message = typeof error === "string" ? error : "error";
            if (error instanceof yup.ValidationError) {
                message = error.message;
            }
            const response = {
                error: {
                    message
                }
            };
            return sendResponse(response);
        }
    });
    socket.on('user:register', async (message, sendResponse) => {
        try {
            const userRegisterReq = types.userRegisterReqSchema.validateSync(message);
            const user = {
                email: userRegisterReq.email,
                password: userRegisterReq.password,
                tokens: [],
            };
            const result = await userCollection.insertOne(user);
            // const created = result.ops[0];
            const response = {
                result: true
            };
            return sendResponse(response);
        }
        catch (error) {
            let message;
            if (error instanceof yup.ValidationError) {
                message = error.message;
            }
            else {
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
function validateToken(token) {
    const user = userCollection.findOne({
        "tokens.token": new mongodb.ObjectID(token)
    });
    return user;
}
const userSocket = io.of("/user");
const userAuthMiddleware = async (socket, next) => {
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
function isUserSocket(socket) {
    return 'user' in socket;
}
userSocket.use(userAuthMiddleware);
userSocket.on("connect", (socket) => {
    if (!isUserSocket(socket)) {
        throw "Socket is not User socket";
    }
    socket.on('room:list', async (message, sendResponse) => {
        try {
            const roomListReq = types.roomListReqSchema.validateSync(message);
            const rooms = await roomCollection.find({ "users.userId": socket.user._id }).toArray();
            const response = { result: rooms };
            return sendResponse(response);
        }
        catch (error) {
            let message;
            if (error instanceof yup.ValidationError) {
                message = error.message;
            }
            else {
                message = `Problém s databází.`;
            }
            const response = {
                error: {
                    message
                }
            };
            return sendResponse(response);
        }
    });
    socket.on('room:create', async (message, sendResponse) => {
        try {
            const roomCreateReq = types.roomCreateReqSchema.validateSync(message);
            const roomUser = {
                userId: socket.user._id,
                email: socket.user.email,
                role: 'author',
            };
            const room = {
                name: roomCreateReq.name,
                users: [roomUser],
                messages: [],
            };
            const result = await roomCollection.insertOne(room);
            const created = result.ops[0];
            const newRoomMessage = {
                room: created
            };
            socket.emit('room:new', newRoomMessage);
            const response = {
                result: true
            };
            return sendResponse(response);
        }
        catch (error) {
            let message;
            if (error instanceof yup.ValidationError) {
                message = error.message;
            }
            else {
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
const roomUserAuthMiddleware = async (socket, next) => {
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
};
roomSocket.use(userAuthMiddleware);
roomSocket.use(roomUserAuthMiddleware);
function isRoomSocket(socket) {
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
            const response = {
                result: true
            };
            return sendResponse(response);
        }
        catch (error) {
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
            const response = {
                result: true
            };
            return sendResponse(response);
        }
        catch (error) {
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
            const response = {
                result: room?.messages ?? []
            };
            sendResponse(response);
        }
        catch (error) {
            const response = {
                error: {
                    message: "chyba"
                }
            };
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
                fs.writeFile(filepath, createMessageReq.file.data, 'binary', (err) => {
                    if (err) {
                        throw err;
                    }
                });
                fileMessage = {
                    file: {
                        path: filepath,
                        name: createMessageReq.file.name
                    }
                };
            }
            const newMessage = {
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
            const response = {
                result: true
            };
            sendResponse(response);
            const newMessageMessage = {
                message: newMessage
            };
            roomSocket.emit("room:newMessage", newMessageMessage);
        }
        catch (error) {
            let message;
            if (isYupValidationError(error)) {
                message = error.message;
            }
            else {
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
            const response = {
                result: result?.users ?? []
            };
            sendResponse(response);
        }
        catch (error) {
            // todo
        }
    });
    socket.on('room:inviteMember', async (message, sendResponse = () => { }) => {
        try {
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
            const newRoomUser = {
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
            const newMemberMessage = {
                user: newRoomUser
            };
            socket.emit('room:newMember', newMemberMessage);
            const response = {
                result: true
            };
            return sendResponse(response);
        }
        catch (error) {
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
            .emit(`wrtc:${toRole}:receive-ice-candidate`, { ...message, from: socket.id });
    });
});
function getOpositeWrtcRole(role) {
    const mapping = {
        offeror: "answerer",
        answerer: "offeror",
    };
    const result = mapping[role];
    return result;
}
httpServer.listen(port);
console.log(`Server listening on port ${port}. Go to http://localhost:${port}.`);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBRTdCLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3pCLE9BQU8sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQzNCLHlEQUF5RDtBQUN6RCxPQUFPLEVBQUUsTUFBTSxFQUFVLE1BQU0sV0FBVyxDQUFDO0FBQzNDLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3hDLE9BQU8sRUFBRSxFQUFFLElBQUksSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sS0FBSyxLQUFLLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sT0FBTyxNQUFNLFNBQVMsQ0FBQTtBQUU3QixNQUFNLFFBQVEsR0FBRyxNQUFNLFNBQVMsRUFBRSxDQUFDO0FBQ25DLE1BQU0sRUFBRSxHQUFHLE1BQU0sS0FBSyxFQUFFLENBQUM7QUFFekIsU0FBUyxvQkFBb0IsQ0FBQyxLQUFVO0lBQ3RDLE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUTtXQUNqRCxDQUNELEtBQUssWUFBWSxHQUFHLENBQUMsZUFBZTtlQUNqQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxpQkFBaUIsQ0FDaEQsQ0FBQTtJQUVILE9BQU8sb0JBQW9CLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQWEsTUFBTSxDQUFDLENBQUM7QUFDekQsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBYSxNQUFNLENBQUMsQ0FBQztBQUV6RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFFbEIscUJBQXFCO0FBQ3JCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FB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