import { writable, derived } from "svelte/store";
import { io } from "socket.io-client";



export const anonymSocket = writable(
  io("ws://localhost:8086", {
    transports: ["websocket"],
  }
));

function createTokenStore() {
  const { subscribe, set } = writable(null, (set) => {
    const token = window.sessionStorage.getItem('token');
    set(window.sessionStorage.getItem('token'));
  });

  return {
    subscribe,
    set: (value) => {
      window.sessionStorage.setItem('token', value);
      set(value);
    }
  }
}

export const token = createTokenStore();
export const isAuthenticated = writable(false);
export const userSocket = writable(null);
token.subscribe((token) => {
  if (token) {
    const socket = io("ws://localhost:8086/user", {
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