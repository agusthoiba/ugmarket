'use strict'

var schema = require('../schema/item');
var mongoose = require('mongoose');

var Model = mongoose.model('Item', schema);

var Item = function(){

}

Item.prototype.find = function(query, sort, fn) {
    query = query || {};
    sort = sort || {created_at: 'desc'};

    var Promise = Model.find(query).sort(sort).exec();

    Promise.then(null, function(err){
        return fn(err);
    })

    Promise.then(function(doc){
        return fn(null, doc);
    })
};

Item.prototype.findOne = function(query) {
    var Promise = Model.findOne().exec();

    Promise.then(null, function(err){
        return fn(err);
    })

    Promise.then(function(doc){
        return fn(null, doc);
    })
};

Item.prototype.create = function(payload, fn){
  var Promise = Model.create(payload);
 
  Promise.then(null, function(err){
    return fn(err)
  })

  Promise.then(function(doc){
    return fn(null, doc)
  })
};

Item.prototype.update = function(query, payload, fn){
  var Promise = Model.update(query, payload);
 
  Promise.then(null, function(err){
    return fn(err)
  })

  Promise.then(function(doc){
    return fn(null, doc)
  })
};

module.exports = new Item();
