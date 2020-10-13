
const config = require('./config');
const Sequelize = require('sequelize');


const connect = async () => {
  console.log(`Connecting Mysql to ${config.db.host}:${config.db.port}...`)
  const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',

    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // disable logging; default: console.log
   logging: false
  });

  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.');
    return sequelize
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
}

module.exports = connect;
