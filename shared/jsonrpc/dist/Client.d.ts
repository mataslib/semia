import * as types from "./types";
interface ClientOptions {
    sendMessage: (message: types.IClientMessage) => void;
}
interface IncompleteMessage {
    method: string;
    params: any[];
}
export declare class Client {
    private waitingRequests;
    constructor(options: ClientOptions);
    request(message: types.IRequest | IncompleteMessage): Promise<unknown>;
    notification(message: types.INotification | IncompleteMessage): Promise<void>;
    incomingMessage(message: types.IResponse): void;
    private completeRequest;
    completeNotification(message: types.INotification | IncompleteMessage): types.INotification;
    private sendMessage;
}
export {};
