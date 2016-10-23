'use strict'

var Schema = require('./global');

var bandSchema = Schema({
        name: {type: String, required: true},
        slug: {type: String, required: true},
        alpha: {type: String},
        genres: [],
        desc: {type: String},
        icon: {type: String},
        logo: {type: String},
        image: [],
        total_product: {type: Number, default:  0}
    }, {
        collection: 'band',
        timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'}
    });

module.exports = bandSchema;
