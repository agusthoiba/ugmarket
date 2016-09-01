'use strict'
var Schema = require('./global');

var itemSchema = Schema({
        name: {type: String, required: true},
        category: {type: Schema.Types.ObjectId, ref: 'Category'},
        band: {type: Schema.Types.ObjectId, ref: 'Band'},
        image: [],
        price: {type: Number, default: 0},
        weight: {type: Number, default: 0},
        description: {type: String, default: ''},
        is_featured: {type: Boolean, default: false},
        is_visible: {type: Boolean, default: false},
        is_deleted: {type: Boolean, default: false},
        condition: {type: String, enum: ['baru', 'bekas']},
        stock: {type: Number, default: 0},
        user: {type: Schema.Types.ObjectId, ref: 'User'},
    }, {
        collection: 'item', 
        timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'}
    });

module.exports = itemSchema;
