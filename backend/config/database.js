const config = require('./index');

module.exports = {
  development: {
    storage: config.dbFile,
    dialect: "sqlite",
    seederStorage: "sequelize",
    logQueryParameters: true,
    typeValidation: true
  },
  test: {
    // Use a default test database path if DB_FILE is not set
    storage: ':memory:',
    dialect: "sqlite",
    logging: false,
    seederStorage: "sequelize"
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      schema: process.env.SCHEMA
    }
  }
};

//This will allow you to load the database configuration environment variables from the .env file into the config/index.js, as well as define the global schema for the project.
