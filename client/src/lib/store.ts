import { writable, derived } from "svelte/store";
import { io } from "socket.io-client";
import { server } from "./globals";



export const anonymSocket = writable(
  io(`ws://${server}`, {
    transports: ["websocket"],
  }
));

function createTokenStore() {
  const { subscribe, set } = writable(null, (set) => {
    const token = JSON.parse(window.sessionStorage.getItem('token'));
    set(token);
  });

  return {
    subscribe,
    set: (value) => {
      window.sessionStorage.setItem('token', JSON.stringify(value));
      set(value);
    }
  }
}

export const token = createTokenStore();
export const isAuthenticated = writable(false);
export const userSocket = writable(null);
token.subscribe((token) => {  
  if (token) {
    const socket = io(`ws://${server}/user`, {
      transports: ["websocket"],
      auth: {
        token: token
      },
    });

    socket.on("connect", () => {
      isAuthenticated.set(true);
    });

    socket.on("connect_error", (err) => {
      // invalid token
      // user not found
      console.log(err.message);
    });

    userSocket.set(socket);
  }
});


export const audioIn = writable(null);
export const audioOut = writable(null);
export const videoIn = writable(null);

export const mediaStream = derived([audioIn, videoIn], ([$audioIn, $videoIn], set) => {
  const audioId = $audioIn?.deviceId;
  const videoId = $videoIn?.deviceId;

  if (audioId || videoId) {
    let constraints = {};

    if (audioId) {
      constraints['audio'] = {
        'deviceId': $audioIn?.deviceId,
        'echoCancellation': true,
      };
    }

    if (videoId) {
      constraints['video'] = {
        'deviceId': $videoIn?.deviceId,
      };
    }

    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => set(mediaStream))
      ;
  } else {
    set(null);
  }
});

export let logout = () => {
  window.sessionStorage.setItem('token', null);
  userSocket.set(null);
  isAuthenticated.set(false);
}