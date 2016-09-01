'use strict'

var schema = require('../schema/category');
var mongoose = require('mongoose');

var Model = mongoose.model('Category', schema);

var Category = function(){

}

Category.prototype.find = function(query, fn) {
    var Promise = Model.find(query).sort({name: 'asc'}).exec();

    Promise.then(null, function(err){
        return fn(err);
    })

    Promise.then(function(doc){
        return fn(null, doc);
    })
}

module.exports = new Category();
