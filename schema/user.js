'use strict'

var Schema = require('./global');

var userSchema = Schema({
        name: {type: String, default: ''},
        gender:  {type: Boolean, default: true},
        email: {type: String, required: true},
        password:  {type: String},
        hp: {type: String, default: ''},
        profile_picture: {type: String},
        is_merchant: {type: Boolean, default: false},
        is_visible: {type: Boolean, default: false},
        is_deleted: {type: Boolean, default: false},
    }, {
        collection: 'user',
        timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'}
    });

module.exports = userSchema;
