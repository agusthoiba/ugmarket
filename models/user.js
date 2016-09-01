'use strict'

var schema = require('../schema/user');
var mongoose = require('mongoose');

var Model = mongoose.model('User', schema);

var User = function(){

}

User.prototype.find = function(query, sort, fn) {
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

User.prototype.findOne = function(query, fn) {
    var Promise = Model.findOne(query).exec();

    Promise.then(null, function(err){
        return fn(err);
    })

    Promise.then(function(doc){
        return fn(null, doc);
    })
};

User.prototype.create = function(payload, fn){
    var Promise = Model.create(payload);

    Promise.then(null, function(err){
        return fn(err)
    })

    Promise.then(function(doc){
        return fn(null, doc)
    })
}

User.prototype.update = function(query, payload, fn){
    var Promise = Model.update(query, payload);

    Promise.then(null, function(err){
        return fn(err)
    })

    Promise.then(function(doc){
        return fn(null, doc)
    })
}

module.exports = new User();
