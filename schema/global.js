'use strict'

/*const mongoose = require('mongoose');
const Schema = mongoose.Schema;*/
const config = require('../config');

/*var db = mongoose.connection;
var connection = mongoose.connect(config.mongouri)

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connection success')
});

module.exports = Schema;*/


const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // SQLite only
  //storage: 'path/to/database.sqlite',

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

module.exports = sequelize;
