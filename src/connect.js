const config = require('./config');
const Sequelize = require('sequelize');

const connect = async () => {
  console.log(`Connecting Mysql ...`)

  const { host, name,password,user,port } = config.db.mysql;

  const sequelize = new Sequelize(name, user, password, {
    host: host,
    dialect: 'mysql',
    pool: {
      max: 100,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
    // logging: false
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
