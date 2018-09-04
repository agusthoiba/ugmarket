

var router = express.Router();

var Product = require('../../../models/product');
var Category = require('../../../models/category');
var Band = require('../../../models/band');
//var User = require(config.base_dir + '/models/user');

var fs = require('fs.extra');
var crypto = require('crypto');
//const Sequelize = require('sequelize');
//const Op = Sequelize.Op
const promisify = require('util').promisify;
const copyFile = promisify(fs.copyFile)
const asyncLan = require('async');
const moment = require('moment')
const upload = require('../../../upload')

router.get('/', function (req, res, next) {
    var userId = parseInt(req.session.user.id);

    var obj = {error: null, data: null};

    var query = {prod_user_id: userId, prod_is_deleted: 0};
    var options = {sort: {prod_created_at: 'desc'}};


    //return res.render('front/account/product_list', obj);
    Product.find(query, {}).then(doc => {
        //console.log('doc cont', doc)
        obj.data = {
            products: doc
        }
        return res.json(doc)
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

router.post('/create', async function (req, res, next) {
    var obj = { error: null, data: null};

    req.body.user_id = req.session.user.id;

    //return res.json(req.body)
    try {
        const payload = await cleanPost(req.body)
        //return res.json(payload)
        await Product.create(payload)
        return res.redirect('/account/product');
    } catch (err) {
        console.error(err);
        obj.error = 'An Error occured while add new product';
        return res.json(obj)
        //return res.render('front/account/product_form', obj);
    }
})

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

async function cleanPost(body){
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
       prod_images: '',
       prod_thumbnails: '',
       prod_sizes_available: '',
       prod_created_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }

    if (typeof body.image_ori == 'string' ) {
        body.image_ori = [body.image_ori];
        body.image_thumbnail = [body.image_thumbnail];
    }

    if (typeof body.sizes == 'string') {
        body.sizes = [body.sizes]
    }

    payload.prod_sizes_available = body.sizes.join(',')

    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    var randomName = crypto.createHash('sha1').update(current_date + random).digest('hex');
    var fileName = payload.prod_slug + '-' + randomName;

    try {
        const oris = await processMultipleUpload('product/original/', body.image_ori, fileName)
        payload.prod_images = oris.join(',')

        const thumbs = await processMultipleUpload('product/thumbnail/', body.image_thumbnail, fileName)
        payload.prod_thumbnails = thumbs.join(',')
        
        return new Promise((resolve, reject) => {
            return resolve(payload)
        })
    } catch (err) {
        return new Promise((resolve, reject) => {
            return reject(err)
        })
    }

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

async function uploadImageBase(path, val, fileName) {
    let imgUrls = []
    const filePathName = path + fileName;
    let img

    try {
        img = await upload.createImageBase64(val, filePathName)
        console.log('img', img)
    } catch (err) {
        return new Promise((resolve, reject) => {
            return reject(err)
        })
    }

    try {
        if (path == 'product/original/') {
            const resize = await copyResize(img.path, fileName+'.'+img.ext)
            console.log('resize', resize)
        }
    } catch (err) {
        return new Promise((resolve, reject) => {
            return reject(err)
        })
    }

    return fileName+'.'+img.ext
}

async function processMultipleUpload(path, images, filename) {
    let imgs = []
    try {
        for (let image of images) {
            const img = await uploadImageBase(path, image, filename)
            imgs.push(img)
        }
        return new Promise((resolve, reject) => {
            return resolve(imgs)
        })
    } catch (err) {
        return new Promise((resolve, reject) => {
            return reject(err)
        })
    }
}

/*async function copyResize(src, name) {
    var destLarge = config.file_dir + 'product/large/'+ name;
        
    let fileLarge
    let fileMedium

    try {
        await copyFile(src, destLarge)
    } catch (err) {
        return err
    }

    try {
        fileLarge = await upload.resize(destLarge, 500, 1000)
    } catch (err) {
        return err
    }
    
    return fileLarge
}*/


async function copyResize(src, name) {
    console.log('src', src)
    
    try {
        const destLarge = config.file_dir + 'product/large/'+ name
        await copyFile(src, destLarge, {replace: false})
        const imgLarge = await upload.resize(src, destLarge, 500, 1000)

        //const destMedium = config.file_dir + 'product/medium/'+ name
        //await copyFile(src, destMedium, {replace: false})
        
        //const imgMedium = await upload.resize(destMedium, 300, 600)
        return {l: imgLarge}
        //m: imgMedium
    } catch (err) {
        return new Promise((resolve, reject) => {
            return reject(err)
        })
    }
    
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
