import * as types from './types';

interface ServerOptions
{
  sendMessage: (message: types.IResponse) => void;
}

type MethodFunction =  (...args: any[]) => types.MethodSuccessResult | types.MethodErrorResult;

export class Server {

  constructor(options: ServerOptions) {
    this.sendMessage = options.sendMessage;    
  }
  
  public incomingMessage(message: types.IClientMessage): void
  {
    if (types.isNotification(message)) {
      this.handleNotification(message);
    }

    if (types.isRequest(message)) {
      this.handleRequest(message);
    }

    throw "Message is not JsonRPC Notification nor Request";
  }

  private handleNotification(message: types.INotification): void
  {
    this.invokeMethod(message.method, message.params);
  }

  private handleRequest(message: types.IRequest): void
  {
    let methodResult = this.invokeMethod(message.method, message.params);
    this.sendMessage({
      jsonrpc: "2.0",
      id: message.id,
      ...methodResult
    });
  }

  public addMethod(name: string, handler: MethodFunction) {
    this.methods[name] = handler;
  }

  private invokeMethod(method: string, params: any[]): any
  {
    let result = this.methods[method](...params);
    return result;
  }

  private sendMessage: (message: types.IResponse) => void;

  private methods: {[name: string]: MethodFunction} = {};
}
