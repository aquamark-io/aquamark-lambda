// index.mjs
export const handler = async (event) => {
  console.log("Event Received:", event);

  // Example response
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, ${event.email}! Your function is working!`,
    }),
  };
};
