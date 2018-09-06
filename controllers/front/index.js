var router = express.Router();

var Product = require('../../models/product');


router.get('/', function (req, res, next) {
	var obj = {error: null, data: {products: []}};
	var query = {prod_is_visible: 1};
  var options = {sort: {prod_id: 'desc'}, limit: 20};
	Product.find(query, options).then(doc => {
		obj.data.products = doc.map(val => {
			val.is_visible = val.prod_is_visible == 1
			const pathThumb = `${config.file_host}/product/thumbnail`
			val.thumbnail =  `${pathThumb}/${val.prod_thumbnails}`
			if (val.prod_thumbnails.includes(',')) {
					let thumbArr = val.prod_thumbnails.split(',')
					val.thumbnail = `${pathThumb}/${thumbArr[0]}`
			}
			return val
		})
		
		//return res.json(req.session);
		res.render('front/index', obj);
	}, function(err) {
		obj.error = 'An Error occured while load your product';
		console.error(err);
		return res.json(err);
	})


});

module.exports = router;
