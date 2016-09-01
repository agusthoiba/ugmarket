'use strict'

var router = express.Router();
const User = require(config.base_dir + '/models/user')

router.get('/', function (req, res, next) {

	var userId = req.session.user.id;
	User.findOne({_id: ObjectId(userId)}, function(err, doc){
		console.log(err, doc);
		var obj = { error: null, data: null};
		if (err) {
			obj.error = 'An Error occured while load profile';
			console.error(err);
			return res.render('error', obj);
		}

		obj.data = {user : doc};

		//return res.json(obj);
		return res.render('front/account/profile', obj);
	});

});

router.post('/update', function (req, res, next) {
	var userId = req.session.user.id;
	var payload = cleanPost(req.body);
	User.update({_id: ObjectId(userId)}, payload, function(err, doc){
		var obj = { error: null, data: null};
		if (err) {
			obj.error = 'An Error occured while load profile';
			console.error(err);
			return res.render('error', obj);
		}

		return res.redirect('/account/product');

	});

});

module.exports = router;

function cleanPost(body){
	var payload = {
		name: body.name.trim(),
		hp: body.hp.trim(),
		gender: body.gender == '1' ? true : false,
	}
	return payload;
}
