import * as http from "http";
import * as fs from 'fs';
// import { server as WebSocketServer } from "websocket";
import { Server } from "socket.io";
import express from "express";
import path from 'path';
const __dirname = path.resolve();

import { initSocket as initAnonymSocket } from "./socket/anonymSocket";
import { initSocket as initUserSocket } from "./socket/userSocket";
import { initSocket as initRoomSocket } from "./socket/roomSocket";
import { serverport } from "./globals";

// Create http server
const expressApp = express();
// server files from public folder
expressApp.use('/public', express.static(__dirname+'/public'));
// client files
expressApp.use(express.static(__dirname+'/client'));
// every other route to client index.html
expressApp.use('*', express.static(__dirname+'/client/index.html'));

const httpServer = http.createServer(expressApp);


const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: "*"
  }
});

// socket with anonymous (not logged in) user
initAnonymSocket({ io });
// socket with authenticated user
initUserSocket({ io });
// socket with authneticated user & member of room
initRoomSocket({ io });

httpServer.listen(serverport);
console.log(`Server listening on port ${serverport}. Go to http://localhost:${serverport}.`);
