'use strict'

var router = express.Router();

var Product = require(config.base_dir + '/models/product');
var Category = require(config.base_dir + '/models/category');
var Band = require(config.base_dir + '/models/band');
var User = require(config.base_dir + '/models/user');

router.get('/', function (req, res, next) {
    var obj = {error: null, data: null};

    var query = {};
    var options = {sort: {created_at: 'desc'}};
    Product.find(query, options).then(function(doc){
        if (doc.length === 0) {
            return res.redirect('/account/product/add');
        }

        obj.data = {
            products: doc
        }
        return res.render('front/product_list', obj);

    }, function(err) {
        obj.error = 'An Error occured while load your product';
        console.error(err);
        return res.json(err);
    })
});

module.exports = router;
