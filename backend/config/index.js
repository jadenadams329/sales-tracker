// backend/config/index.js
module.exports = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8050,
    dbFile: process.env.DB_FILE,
    jwtConfig: {
      get secret() {
        return process.env.JWT_SECRET;
      },
      get expiresIn() {
        return process.env.JWT_EXPIRES_IN;
      },
    },
  };
