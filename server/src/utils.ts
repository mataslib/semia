export const emptyFn = () => {};

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

export const withErrorCatch = async (sendResponse: any = emptyFn, fn: any = emptyFn) => {
  try {
    await Promise.resolve(fn());
  } catch (error) {
    sendResponse(errorResponse(error));
  }
}


// function isYupValidationError(error: any): error is yup.ValidationError {
//   const isYupValidationError = typeof error === "object"
//     && (
//       error instanceof yup.ValidationError
//       || error.constructor.name === "ValidationError"
//     )

//   return isYupValidationError;
// }
