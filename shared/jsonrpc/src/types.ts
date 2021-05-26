export type TJsonRpcId = string | number;

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
  error?: MethodErrorResult,
  id: TJsonRpcId;
}

export type MethodSuccessResult = any;
export type MethodErrorResult = {
  code: number,
  message: string,
  data?: any,
};


export function isJsonRpcMessage(message: any): message is IMessage {
  return message?.jsonrpc === '2.0';
}

export function isNotification(message: any): message is INotification {
  return isJsonRpcMessage(message)
    && 'method' in message
    && 'params' in message
    && !('id' in message)
    ;
}

export function isRequest(message: any): message is IRequest {
  return isJsonRpcMessage(message)
    && 'method' in message
    && 'params' in message
    && 'id' in message
  ;
}

export function isResponse(message: any): message is IResponse {
  return isJsonRpcMessage(message) && (
    'result' in message
    || 'error' in message
  );
}