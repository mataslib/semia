/**
 * Alias of empty function
 */
export const emptyFn = () => {};

/**
 * Creates error response from generic error
 *
 * @param error 
 * @returns 
 */
export const errorResponse = (error: any) => {
  let message = "Server error.";

  if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && "message" in error) {
    message = error.message;
  }

  return {
    error: {
      message
    }
  }
} 

/**
 * Wraps sync/async function with try-catch
 * and it sends error response on error
 * 
 * @param sendResponse function able to send response to client
 * @param fn function with code to be executed
 */
export const withErrorCatch = async (sendResponse: any = emptyFn, fn: any = emptyFn) => {
  try {
    await Promise.resolve(fn());
  } catch (error) {
    sendResponse(errorResponse(error));
  }
}
