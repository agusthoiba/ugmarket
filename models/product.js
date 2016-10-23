'use strict'

var schema = require('../schema/product');
var mongoose = require('mongoose');
//var Promise = require('promise');
var Model = mongoose.model('Product', schema);

var Product = function(){

}

Product.prototype.find = function(query, options) {
    query = query || {};
    options = options || {};

    options = Object.assign(options, {populate: ['category', 'band', 'user']})
    return new Promise(function(resolve, reject) {
        Model.paginate(query, options, function(err, doc) {
            if (err) return reject(err);

            resolve(doc);
        });
    })
};

Product.prototype.findOne = function(query) {
    return new Promise(function(resolve, reject) {
        Model.findOne(query, function(err, doc) {
            if(err) return reject(err);
            resolve(doc);
        })
    })
};

Product.prototype.create = function(payload, fn){
  var Promise = Model.create(payload);

  Promise.then(null, function(err){
    return fn(err)
  })

  Promise.then(function(doc){
    return fn(null, doc)
  })
};

Product.prototype.update = function(query, payload, fn){
  var Promise = Model.update(query, payload);

  Promise.then(null, function(err){
    return fn(err)
  })

  Promise.then(function(doc){
    return fn(null, doc)
  })
};

module.exports = new Product();
