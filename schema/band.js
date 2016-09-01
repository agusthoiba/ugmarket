'use strict'

var Schema = require('./global');

var bandSchema = Schema({
        name: {type: String, required: true},
        desc: {type: String},
        icon: {type: String},
        image: {type: String},
    }, {
        collection: 'band', 
        timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'}
    });

module.exports = bandSchema;
