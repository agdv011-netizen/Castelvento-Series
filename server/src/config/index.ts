export const config = {
  url: process.env.SERVER_URL || "http://localhost:3000",
  port: process.env.SERVER_PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};
