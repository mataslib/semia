export declare type TJsonRpcId = string | number;
export interface IMessage {
    jsonrpc: "2.0";
}
export interface IClientMessage extends IMessage {
    method: string;
    params: any[];
}
export interface INotification extends IClientMessage {
}
export interface IRequest extends IClientMessage {
    id: TJsonRpcId;
}
export interface IResponse extends IMessage {
    result?: MethodSuccessResult;
    error?: MethodErrorResult;
    id: TJsonRpcId;
}
export declare type MethodSuccessResult = any;
export declare type MethodErrorResult = {
    code: number;
    message: string;
    data?: any;
};
export declare function isJsonRpcMessage(message: any): message is IMessage;
export declare function isNotification(message: any): message is INotification;
export declare function isRequest(message: any): message is IRequest;
export declare function isResponse(message: any): message is IResponse;
