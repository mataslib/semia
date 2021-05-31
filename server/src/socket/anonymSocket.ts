// socket with anonymous (not logged in) user

import { Server } from "socket.io";
import { emptyFn, withErrorCatch } from "../utils";
import * as types from "../types";
import mongodb from 'mongodb'
import { userCollection } from "../collection/userCollection";

export function initSocket(params: {io: Server}) {
  const { io } = params;

  const anonymSocket = io.of("/");

  anonymSocket.on("connection", (socket) => {
    socket.on('authentication', async (message, sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, async () => {
        const userAuthReq = types.userAuthReqSchema.validateSync(message);

        let user = await userCollection.findOne({ email: userAuthReq.email });
        if (!user) {
          throw `Non-existing email.`;
        }
        if (user.password !== userAuthReq.password) {
          throw `Invalid password.`;
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
      });
    });

    socket.on('user:register', async (message, sendResponse = emptyFn) => {
      withErrorCatch(sendResponse, async () => {
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
      });
    });
  });
}