var router = express.Router();

var Item = require(config.base_dir + '/models/item');

router.get('/', function (req, res, next) {
	//Item.find(null, null, function(err, doc){
		//console.log(err, doc);
		console.log(req.session);
		res.render('front/index');
	//})
});

module.exports = router;
