import * as types from './types';
interface ServerOptions {
    sendMessage: (message: types.IResponse) => void;
}
declare type MethodFunction = (...args: any[]) => types.MethodSuccessResult | types.MethodErrorResult;
export declare class Server {
    constructor(options: ServerOptions);
    incomingMessage(message: types.IClientMessage): void;
    private handleNotification;
    private handleRequest;
    addMethod(name: string, handler: MethodFunction): void;
    private invokeMethod;
    private sendMessage;
    private methods;
}
export {};
