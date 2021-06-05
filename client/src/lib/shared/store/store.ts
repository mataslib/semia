/**
 * This file contains main application stores.
 * Store holds data that can be accessed from all components.
 * Components subscribe to store value changes.
 */
import { writable, derived } from "svelte/store";
import { io } from "socket.io-client";
import { server } from "../globals";

// anonym socket store
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
// acess token store
export const token = createTokenStore();


// whether user is authenticated store
export const isAuthenticated = writable(false);
// user socket store
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


export let logout = () => {
  window.sessionStorage.setItem('token', null);
  userSocket.set(null);
  isAuthenticated.set(false);
}
