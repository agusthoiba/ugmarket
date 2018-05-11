'use strict'

var Schema = require('./global');

var categorySchema = Schema({
        name: {type: String, required: true},
        parent_id:  {type: String},
        parent_rank:  {type: Number},
        image: {type: String},
        is_visible: {type: Boolean, default: false},
        is_deleted: {type: Boolean, default: false},
    }, {
        collection: 'category', 
        timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'}
    });
    
module.exports = categorySchema;
