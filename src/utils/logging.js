export const logError = (error, context = {}) => {
  console.error({
    message: error.message,
    stack: error.stack,
    context,
  });
};
