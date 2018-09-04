var router = express.Router();

var Product = require('../../models/product');


router.get('/', function (req, res, next) {
	var obj = {error: null, data: null};
	var query = {prod_is_visible: 1};
  var options = {sort: {prod_created_at: 'desc'}};
	Product.find(query, options).then(function(doc){
		//var
		obj.data = {
			products: doc
		}
		
		//return res.json(req.session);
		res.render('front/index', obj);
	}, function(err) {
		obj.error = 'An Error occured while load your product';
		console.error(err);
		return res.json(err);
	})


});

module.exports = router;
