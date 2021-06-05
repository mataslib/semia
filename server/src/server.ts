import * as http from "http";
import { Server } from "socket.io";
import express from "express";
import { initSocket as initAnonymSocket } from "./socket/anonymSocket";
import { initSocket as initUserSocket } from "./socket/userSocket";
import { initSocket as initRoomSocket } from "./socket/roomSocket";
import { serverport } from "./globals";
import path from 'path';
const __dirname = path.resolve();

const expressApp = express();

// serve files from public folder
expressApp.use('/public', express.static(__dirname+'/public'));
// serve client files from client folder (symlink)
expressApp.use(express.static(__dirname+'/client'));
// every other route to client's index.html
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
