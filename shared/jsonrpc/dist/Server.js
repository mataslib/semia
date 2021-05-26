import * as types from './types';
export class Server {
    constructor(options) {
        this.methods = {};
        this.sendMessage = options.sendMessage;
    }
    incomingMessage(message) {
        if (types.isNotification(message)) {
            this.handleNotification(message);
        }
        if (types.isRequest(message)) {
            this.handleRequest(message);
        }
        throw "Message is not JsonRPC Notification nor Request";
    }
    handleNotification(message) {
        this.invokeMethod(message.method, message.params);
    }
    handleRequest(message) {
        let methodResult = this.invokeMethod(message.method, message.params);
        this.sendMessage({
            jsonrpc: "2.0",
            id: message.id,
            ...methodResult
        });
    }
    addMethod(name, handler) {
        this.methods[name] = handler;
    }
    invokeMethod(method, params) {
        let result = this.methods[method](...params);
        return result;
    }
}
