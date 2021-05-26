import * as types from "./types";
import { v4 as uuid } from "uuid";
export class Client {
    constructor(options) {
        this.waitingRequests = {};
        this.sendMessage = options.sendMessage;
    }
    async request(message) {
        const request = this.completeRequest(message);
        this.sendMessage(request);
        const response = await new Promise((resolve, reject) => {
            this.waitingRequests[request.id] = resolve;
        });
        return response;
    }
    async notification(message) {
        const notification = this.completeNotification(message);
        this.sendMessage(notification);
    }
    incomingMessage(message) {
        this.waitingRequests[message.id](message);
    }
    completeRequest(message) {
        if (types.isRequest(message)) {
            return message;
        }
        let completedMessage = {
            jsonrpc: "2.0",
            method: message.method,
            params: message.params,
            id: uuid(),
        };
        return completedMessage;
    }
    completeNotification(message) {
        if (types.isNotification(message)) {
            return message;
        }
        let completedMessage = {
            jsonrpc: "2.0",
            method: message.method,
            params: message.params,
        };
        return completedMessage;
    }
}
