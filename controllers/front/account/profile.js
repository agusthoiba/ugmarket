'use strict'

var router = express.Router();
const User = require(config.base_dir + '/models/user')

router.get('/', function (req, res, next) {
	var obj = { error: null, data: null};
	var userId = req.session.user.id;
	const user = new User()
	user.findOne({user_id: userId}).then(doc => {
		obj.data = {user : doc};

		//return res.json(obj);
		return res.render('front/account/profile', obj);
	}, err => {
		obj.error = 'An Error occured while load profile';
		console.error(err);
		return res.render('error', obj);
	});
});

router.post('/update', function (req, res, next) {
	var obj = { error: null, data: null};
	var userId = req.session.user.id;
	var payload = cleanPost(req.body);
	const user = new User()
	user.update({user_id: userId}, payload).then(doc => {
		return res.redirect('/account/product');
	}, err => {
		console.error(err);
		obj.error = 'An Error occured while load profile';
		return res.render('front/account/profile', obj);
	});
});

module.exports = router;

function cleanPost(body){
	var payload = {
		user_name: body.name.trim(),
		user_hp: body.hp.trim(),
		user_gender: body.gender == '1' ? 'm' : 'f',
	}
	return payload;
}
