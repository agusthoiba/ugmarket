'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

var db = mongoose.connection;
var connection = mongoose.connect(config.mongouri)

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connection success')
});

module.exports = Schema;