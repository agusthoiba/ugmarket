'use strict'
var Schema = require('./global');
var mongoosePaginate = require('mongoose-paginate');

var productSchema = Schema({
        name: {type: String, required: true},
        slug: {type: String, required: true},
        category: {type: Schema.Types.ObjectId, ref: 'Category'},
        band:  {type: Schema.Types.ObjectId, ref: 'Band'},
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
        collection: 'product',
        timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'}
    });

productSchema.plugin(mongoosePaginate);

module.exports = productSchema;
