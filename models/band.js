'use strict'

var schema = require('../schema/band');
var mongoose = require('mongoose');

var Model = mongoose.model('Band', schema);

var Band = function(){

}

Band.prototype.find = function(query, sort) {
	query = query || {};
	sort = sort || {name: 'asc'};

    var prom = Model.find(query).sort(sort).exec();

	return new Promise(function(resolve, reject) {
	    prom.then(null, function(err){
	        reject(err);
	    })

	    prom.then(function(doc){
	        resolve(doc);
	    })
	})
};

Band.prototype.findOne = function(query) {
    var Promise = Model.findOne().exec();

    Promise.then(null, function(err){
        return fn(err);
    })

    Promise.then(function(doc){
        return fn(null, doc);
    })
};

Band.prototype.create = function(payload, fn){
  var Promise = Model.create(payload);

  Promise.then(null, function(err){
    return fn(err);
  })

  Promise.then(function(doc){
    return fn(null, doc);
  })
}

Band.prototype.update = function(query, payload, fn){
  var Promise = Model.update(query, payload);

  Promise.then(null, function(err){
    return fn(err);
  })

  Promise.then(function(doc){
    return fn(null, doc);
  })
}

module.exports = new Band();
