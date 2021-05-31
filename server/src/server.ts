import * as http from "http";
import * as fs from 'fs';
// import { server as WebSocketServer } from "websocket";
import { Server } from "socket.io";
import { getDb, getClient } from "./db";
import { initSocket as initAnonymSocket } from "./socket/anonymSocket";
import { initSocket as initUserSocket } from "./socket/userSocket";
import { initSocket as initRoomSocket } from "./socket/roomSocket";


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

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: "*"
  }
});

initAnonymSocket({io});
initUserSocket({io});
initRoomSocket({io});


httpServer.listen(port);
console.log(`Server listening on port ${port}. Go to http://localhost:${port}.`);
