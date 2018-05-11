'use strict'

var router = express.Router();

var Product = require(config.base_dir + '/models/product');
var Category = require(config.base_dir + '/models/category');
var Band = require(config.base_dir + '/models/band');
var User = require(config.base_dir + '/models/user');
var upload = require(config.base_dir + '/upload');
var fs = require('fs.extra');
var crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = Sequelize.Op


router.get('/', function (req, res, next) {
    var userId = parseInt(req.session.user.id);

    var obj = {error: null, data: null};

    var query = {prod_user_id: userId};
    var options = {sort: {created_at: 'desc'}};


    //return res.render('front/account/product_list', obj);
    Product.find(query, {}).then(doc => {

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
    var obj = {
        error: null,
        data: {},
        js: ['account_product']
    };

    getSyncData().then(doc =>  {
        obj.data = doc
        obj.data.item = itemData()
        //return res.json(obj)
        return res.render('front/account/product_form', obj);
    }, err => {
        return res.json(obj)
    })
});

router.post('/create', function (req, res, next) {
    var obj = { error: null, data: null};

    req.body.user_id = req.session.user.id;
    cleanPost(req.body, function(err, payload) {
        if (err) {
            console.error(err);
            obj.error = 'An Error occured while add new product';
            return res.render('front/account/product_form', obj);
        }

        Product.create(payload).then(doc => {
            return res.redirect('/account/product');
        }, err => {
            console.error(err);
            obj.error = 'An Error occured while add new product';
            return res.render('front/account/product_form', obj);
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
        size: '',
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
       prod_name: body.name.trim(),
       prod_slug: slug(body.name.trim().toLowerCase()),
       prod_cat_id: body.category,
       prod_desc: body.description.trim(),
       prod_price: parseInt(body.price),
       prod_weight: parseInt(body.weight),
       prod_condition: body.condition,
       prod_stock: parseInt(body.stock),
       prod_band_id: body.band,
       prod_user_id: parseInt(body.user_id),
       prod_is_visible: body.is_visible == 'publish',
       image: [],
       thumbnail: []
    }

    if (typeof body.image_ori == 'string' ) {
        body.image_ori = [body.image_ori];
        body.image_thumbnail = [body.image_thumbnail];
    }

    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    var randomName = crypto.createHash('sha1').update(current_date + random).digest('hex');
    var fileName = payload.slug + '-' + randomName;

    /*async.parallel({
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
    })*/
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

function getCategory() {
    return new Promise((resolve, reject) => {
        Category.find({}, {}).then(doc => {
            return resolve(doc);
        }, err => {
            return reject(err);
        });
    })
}

function getBand() {
    let query = {}
    let option = {
        order: [
           ['band_name','asc']
        ]
    }

    return new Promise((resolve, reject) => {
        Band.find(query, option).then(doc => {
            console.log('doc', doc)
            return resolve(doc);
        }, err => {
            return reject(err);
        });
    })
}

async function getSyncData() {
    let result = {
        categories: await getCategory(),
        bands: await getBand()
    }
    return result;
}
