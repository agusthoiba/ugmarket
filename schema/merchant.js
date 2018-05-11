'use strict'

var Schema = require('./global');

var merchantSchema = schema({
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        name: {type: String, required: true},
        address: {type: String},
        telp: {type: String},
        hp: {type: String},
        description: {type: String},
        image: [],
        is_visible: {type: Boolean, default: false},
        is_deleted: {type: Boolean, default: false},
    }, {
        collection: 'merchant',
        timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'}
    });

module.exports = merchantSchema;
