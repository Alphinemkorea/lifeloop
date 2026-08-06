export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'lifeloop_jwt_secret_key_2026',
  nodeEnv: process.env.NODE_ENV || 'development'
};
