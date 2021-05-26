import * as types from "./types";
import {v4 as uuid} from "uuid";

interface ClientOptions
{
  sendMessage: (message: types.IClientMessage) => void;
}

interface IncompleteMessage {
  method: string;
  params: any[];
}

type PromiseResolveFunction = (value: unknown) => void;

export class Client
{
  private waitingRequests: {[id in types.TJsonRpcId]: PromiseResolveFunction} = {};

  constructor(options: ClientOptions) {
    this.sendMessage = options.sendMessage;
  }

  public async request(message: types.IRequest | IncompleteMessage)
  {
    const request = this.completeRequest(message);
    this.sendMessage(request);
    const response = await new Promise((resolve, reject) => {
      this.waitingRequests[request.id] = resolve;
    });
    return response;
  }


  public async notification(message: types.INotification | IncompleteMessage)
  {
    const notification = this.completeNotification(message);
    this.sendMessage(notification);
  }

  public incomingMessage(message: types.IResponse) {
    this.waitingRequests[message.id](message);
  }

  private completeRequest(message: types.IRequest | IncompleteMessage)
  {
    if (types.isRequest(message)) {
      return message;
    }
    let completedMessage: types.IRequest = {
      jsonrpc: "2.0",
      method: message.method,
      params: message.params,
      id: uuid(),
    }
    
    return completedMessage;
  }

  public completeNotification(message: types.INotification | IncompleteMessage)
  {
    if (types.isNotification(message)) {
      return message;
    }
    let completedMessage: types.INotification = {
      jsonrpc: "2.0",
      method: message.method,
      params: message.params,
    }
    
    return completedMessage;
  }

  private sendMessage: (message: types.IClientMessage) => void;

}