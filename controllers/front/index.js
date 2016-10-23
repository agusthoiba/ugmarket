var router = express.Router();

var Product = require(config.base_dir + '/models/product');


router.get('/', function (req, res, next) {
	var obj = {error: null, data: null};
	var query = {is_visible: true};
    var options = {sort: {created_at: 'desc'}};
	Product.find(query, options).then(function(doc){
		//var
		obj.data = {
			products: doc
		}
		
		res.render('front/index', obj);
	}, function(err) {
		obj.error = 'An Error occured while load your product';
		console.error(err);
		return res.json(err);
	})


});

module.exports = router;
