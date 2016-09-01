'use strict'

var router = express.Router();

var Item = require(config.base_dir + '/models/item');
var Category = require(config.base_dir + '/models/category');
var User = require(config.base_dir + '/models/user');

router.get('/', function (req, res, next) {
    var userId = mongoose.Types.ObjectId(req.session.user.id);
    Item.find({user: userId}, null, function(err, doc){
        var obj = { error: null, data: null};    
        if (err) {
            obj.error = 'An Error occured while load your product';
            console.error(err);
            return res.render('/error', obj);
        }

        obj.data = doc;
        return res.render('front/account/product_list', obj);
    });
});

router.get('/edit/:id', function (req, res, next) {
    var userId = ObjectId(req.session.user.id);

    async.parallel({
        item: function(fn){
            Item.findOne({user: userId, _id: req.params.id}, function(err, doc){
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
    Item.update({ _id: req.params.id}, req.body, function(err, doc){
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
    
    Category.find({}, function(err, doc){
        if (err) {
            console.error(err);
            return next();
        }

        var obj = {
            error: null, 
            data: {
                category: doc,
                item: itemData()
            }
        };

        return res.render('front/account/product_form', obj);
    });
});

router.post('/add', function (req, res, next) {
    Item.create(req.body, function(err, doc){
        var obj = { error: null, data: null};

        if (err) {
            obj.error = 'An Error occured while add new product';
            console.error(err);
            return res.render('/error', obj);
        }

        return res.redirect('/account/product');
    });
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
        image: []
    }
}

function cleanPost(body){
    var payload = {
       name: body.name.trim(),
       category: body.category,
       description: body.description,
       price: parseInt(body.price),
       weight: parseInt(body.weight),
       condition: body.condition,
       stock: parseInt(body.stock),
       user: ObjectId(body.user_id) 
    }

    if (body.image && body.image != '') {
        payload.image = body.image.split(',')
    }

    return payload;
}

function uploadImages(req, files){

}