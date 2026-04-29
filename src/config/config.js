require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false,
};

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig, database: `${process.env.DB_NAME}_test` },
  production: { ...baseConfig },
};
