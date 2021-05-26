export function isJsonRpcMessage(message) {
    return message?.jsonrpc === '2.0';
}
export function isNotification(message) {
    return isJsonRpcMessage(message)
        && 'method' in message
        && 'params' in message
        && !('id' in message);
}
export function isRequest(message) {
    return isJsonRpcMessage(message)
        && 'method' in message
        && 'params' in message
        && 'id' in message;
}
export function isResponse(message) {
    return isJsonRpcMessage(message) && ('result' in message
        || 'error' in message);
}
