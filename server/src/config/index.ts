export const config = {
  url: process.env.SERVER_URL || `http://${process.env.SERV_HOST || 'localhost'}:${process.env.SERV_PORT || 3000}`,
  port: Number(process.env.SERV_PORT) || 3000,
  host: process.env.SERV_HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
};
