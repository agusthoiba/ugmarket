var router = express.Router();
const upload = require('../../../helpers/upload')

router.get('/', function (req, res, next) {
	var obj = { 
		error: null, 
		data: null,
		js: ['account_product']
	};
	var userId = req.session.user.id;
	return res.locals.userModel.findOne({user_id: userId}).then(doc => {
		obj.data = {user : doc};

		return res.render('front/account/profile', obj);
	}, err => {
		obj.error = 'An Error occured while load profile';
		console.error(err);
		return res.render('error', obj);
	});
});

router.post('/update', async function (req, res, next) {
	var obj = { error: null, data: null};
	var userId = req.session.user.id
	const payload = await cleanPost(req.body, userId);
	res.locals.userModel.update({user_id: userId}, payload).then(doc => {
		return res.redirect('/account/product');
	}, err => {
		console.error(err);
		obj.error = 'An Error occured while load profile';
		return res.render('front/account/profile', obj);
	});
});

module.exports = router;

async function cleanPost(body, userId){
	var payload = {
		user_name: body.name.trim(),
		user_hp: body.hp.trim(),
		user_gender: body.gender == '1' ? 'm' : 'f'
	}

	try {
		const oris = await upload.processMultipleUpload('user/original/', [body.image_ori], userId)
		console.log('oris', oris)
		payload.user_avatar = oris.join(',');
  
		const thumbs = await upload.processMultipleUpload('user/thumbnail/', [body.image_thumbnail], userId)
  
		return new Promise((resolve, reject) => {
		  return resolve(payload)
		})
	  } catch (err) {
		return new Promise((resolve, reject) => {
		  return reject(err)
		})
	  }
}
