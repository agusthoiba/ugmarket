'use strict'

var router = express.Router();

var Product = require(config.base_dir + '/models/product');
var Category = require(config.base_dir + '/models/category');
var Band = require(config.base_dir + '/models/band');
var User = require(config.base_dir + '/models/user');
var upload = require(config.base_dir + '/upload');
var fs = require('fs.extra');
var crypto = require('crypto');

router.get('/', function (req, res, next) {
    var userId = ObjectId(req.session.user.id);

    var obj = {error: null, data: null};

    var query = {user: userId};
    var options = {sort: {created_at: 'desc'}};
    Product.find(query, options).then(function(doc){
        if (doc.length === 0) {
            return res.redirect('/account/product/add');
        }

        obj.data = {
            products: doc
        }
        return res.render('front/account/product_list', obj);

    }, function(err) {
        obj.error = 'An Error occured while load your product';
        console.error(err);
        return res.json(err);
    })
});

router.get('/edit/:id', function (req, res, next) {
    var userId = ObjectId(req.session.user.id);

    async.parallel({
        product: function(fn){
            Product.findOne({user: userId, _id: req.params.id}, function(err, doc){
                fn(err, doc);
            });
        },
        category: function(fn){
            Category.find({}, function(err, doc){
                fn(err, doc)
            });
        }
    }, function(err, results){
        var obj = { error: err, data: results};

        if (err) {
            obj.error = 'An Error occured while load your product';
            console.error(err);
            return res.render('front/error', obj);
        }

        return res.render('front/account/product_edit.html', obj);
    });
});

router.put('/update/:id', function (req, res, next) {
    Product.update({ _id: req.params.id}, req.body, function(err, doc){
        var obj = { error: null, data: null};

        if (err) {
            obj.error = 'An Error occured while update your product';
            console.error(err);
            return res.render('/error', obj);
        }

        return res.redirect('/account/product');
    });
});


router.get('/add', function (req, res, next) {

    async.parallel({
        categories: function(fn) {
            Category.find({}, function(err, doc){
                if (err) return fn(err);
                fn(null, doc)
            })
        },
        bands: function(fn) {
            Band.find({}).then(function(doc) {
                fn(null, doc);
            }, function(err) {
                fn(err);
            })
        },
        item: function(fn) {
            fn(null, itemData())
        }
    }, function(err, results){

        var obj = {
            error: null,
            data: results,
    		js: ['account_product']
        };

        //return res.json(obj);
        return res.render('front/account/product_form', obj);
    })
});

router.post('/create', function (req, res, next) {
    var obj = { error: null, data: null};

    req.body.user_id = req.session.user.id;
    cleanPost(req.body, function(err, payload) {
        if (err) {
            console.error(err);
            //obj.error = 'An Error occured while add new product';
            //return res.render('/error', obj);
            return res.json(err);
        }

        Product.create(payload, function(err, doc){
            if (err) {
                console.error(err);
                obj.error = 'An Error occured while add new product';
                return res.render('/error', obj);
            }

            return res.redirect('/account/product');
        });
    })
});

module.exports = router;

function itemData(){
    return {
        name: '',
        category: '',
        description: '',
        price: 0,
        weight: 0,
        stock: 1,
        image: [],
        band:''
    }
}

/*function validate(req) {
    req.assert('name').notEmpty().len(2, 150);
    req.assert('category').notEmpty();
    req.assert('price').notEmpty();

    var errVal = [];
    if (req.validationErrors()) {
        var error = req.validationErrors();
        for (var i in error) {
            errVal.push(error[i].param + ' ' + error[i].msg);
        }
    }

    return errVal;
}*/

function cleanPost(body, fn){
    var payload = {
       name: body.name.trim(),
       slug: slug(body.name.trim().toLowerCase()),
       category: ObjectId(body.category),
       description: body.description.trim(),
       price: parseInt(body.price),
       weight: parseInt(body.weight),
       condition: body.condition,
       stock: parseInt(body.stock),
       band: body.band,
       user: ObjectId(body.user_id),
       is_visible: body.is_visible == 'publish',
       image: [],
       thumbnail: [],
       user: ObjectId(body.user_id)
    }

    if (typeof body.image_ori == 'string' ) {
        body.image_ori = [body.image_ori];
        body.image_thumbnail = [body.image_thumbnail];
    }

    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    var randomName = crypto.createHash('sha1').update(current_date + random).digest('hex');
    var fileName = payload.slug + '-' + randomName;

    async.parallel({
        img: function(cbPar) {
            async.forEachOf(body.image_ori, function(val, k, cb) {
                var filePathName = 'product/original/' + fileName;
                upload.createImageBase64(val, 'product/original/' + fileName, function(err, img) {
                    if(err) return cb(err);

                    payload.image.push(img.url);
                    copyResize(img.path, fileName+'.'+img.ext).then(function(doc){
                        cb();
                    }, function(err) {
                        return cb(err);
                    })
                })
            }, function(err) {
                if (err) return cbPar(err)

                return cbPar(null, payload);
            })
        },
        thumb: function(cbPar){
            async.forEachOf(body.image_thumbnail, function(val, k, cb) {
                upload.createImageBase64(val, 'product/thumbnail/' + fileName, function(err, img) {
                    if(err) return cb(err);

                    payload.thumbnail.push(img.url);
                    cb();
                })
            }, function(err) {
                if (err) return cbPar(err)

                return cbPar(null, payload);
            })
        }
    }, function(err, results) {
        if (err) return fn(err)
        return fn(null, payload);
    })
}

function uploadImages(req, files){

}

function copyResize(src, name) {
    return new Promise(function (resolve, reject) {
        async.parallel({
            large: function(fn) {
                var dest = config.file_dir + 'product/large/'+ name;
                fs.copy(src, dest, {replace: false}, function(err) {
                    if (err) {
                        console.error('error controllers/product.js:216:63');
                        return fn(err);
                    }

                    upload.resize(dest, 500, 1000, function(err, img) {
                        if (err) {
                            console.error('error controllers/product.js:222:55');
                            return fn(err);
                        }

                        fn(null, dest);
                    })
                })
            },
            medium: function(fn) {
                var dest = config.file_dir + 'product/medium/'+ name;
                fs.copy(src, dest, {replace: false}, function(err) {
                    if (err) {
                        console.error('error controllers/product.js:228:63');
                        return fn(err);
                    }

                    upload.resize(dest, 300, 600, function(err, img) {
                        if (err) {
                            console.error('error controllers/product.js:234:55');
                            return fn(err);
                        }

                        fn(null, dest);
                    });
                });
            }
        }, function(err, results) {
            if (err) {
                console.error('error controllers/product.js:244:21');
                return reject(err);
            }
            resolve(results);
        });
    });
}
