const pagination = require('../../helpers/pagination');
const Upload = require('../../helpers/uploadCloudinary');

var router = express.Router();

router.get('/', async function (req, res, next) {
	var obj = { 
		error: null, 
		data: null,
		//js: ['account_product']
	};

	let query = {};
	const pageLimit = 10;
	let option = {
		limit: pageLimit,
		page: req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1,
	};

	try {
		const bandCount = await res.locals.bandModel.count(query);


		if (bandCount > 0) {
			const bands = await res.locals.bandModel.find(query, option);

			const currentPage = option.page;
			
			const bandList = bands.map(val => {
				val.logo = req.app.locals.cloudinary.image(`bands/${val.band_slug}-logo.png`, {
					transformation: [
						{width: 75}
					]
				});
				val.thumbnail = req.app.locals.cloudinary.image(`bands/${val.band_slug}-thumbnail.jpg`, {
					transformation: [
						{width: 100, height: 100}
					]
				});
				return val;
			});
			
			const page = pagination(bandList, pageLimit, currentPage, bandCount);
		    Object.assign(obj, page)
		}

		// return res.json(obj);
		return res.render('admin/band_list', obj);
	} catch (err) {
    	// return res.json(obj);
	
		obj.error = 'An Error occured while load band list';
		console.error(err);
		return res.render('admin/band_list', obj);
	}
});

router.get('/add', async function (req, res, next) {
	var obj = { 
		error: null, 
		data: {
			band: {
				band_name: '',
				band_slug: '',
				band_thumbnail: '',
				logo: '',
				thumbnail: '',
				banner: '',
				band_genre: '',
				band_desc: '',
				band_is_local: false,
				band_enabled: false
			},
			genres: await res.locals.genreModel.find(),
		},
		action: '/admin/band'
		//js: ['account_product']
	};

	// return res.json(obj);
	return res.render('admin/band_form', obj);
});

router.get('/edit/:id', async function (req, res, next) {
	const bandId = parseInt(req.params.id, 10);

	var obj = { 
		error: null, 
		data: {
			band: {},
			genres: await res.locals.genreModel.find(),
		},
		action: `/admin/band/update/${bandId}`
		//js: ['account_product']
	};

	let query = {
		band_id: bandId
	};

	const band = await res.locals.bandModel.findOne(query);

	obj.data.band = Object.assign({}, band, {
		logo: req.app.locals.cloudinary.url(`bands/${band.band_slug}-logo.png`, {width: 150, height: 50}),
		thumbnail: req.app.locals.cloudinary.url(`bands/${band.band_slug}-thumbnail.jpg`, {width: 100, height: 100}),
		banner: req.app.locals.cloudinary.url(`bands/${band.band_slug}-banner.jpg`, {width: 300, height: 75})
	})


	// return res.json(obj);
	return res.render('admin/band_form', obj);
});

router.post('/', async function (req, res, next) {
	var obj = { error: null, data: null};

	const { payload, images } = await cleanPost(req.body);

	// return res.json(payload)
	await res.locals.bandModel.create(payload);

	return res.redirect('/admin/band');
});

router.post('/update/:id', async function (req, res, next) {
	var obj = { error: null, data: null};
	var bandId = parseInt(req.params.id, 10);

	const { payload, _ } = await cleanPost(req.body);

	try {
		await res.locals.bandModel.update({band_id: bandId}, payload);
		return res.redirect('/admin/band');
	} catch (err) {
		console.error(err);
		obj.error = `An error occured while update band ${payload.name}`;
		return res.render('admin/band_form', obj);
	}
});

module.exports = router;

async function cleanPost(body) {
	let payload = {
		band_name: (body.name).trim(),
		band_slug: '',
		band_genre: body.genre,
		band_desc: (body.desc).trim(),
		band_is_local: body.is_local != null ? parseInt(body.is_local, 10) : 0,
		band_enabled: body.enabled != null ? parseInt(body.enabled, 10): 0
	}

	payload.band_slug = slug((payload.band_name).toLowerCase());
	
	let images = {
		logo: '',
		thumbnail: '',
		banner: ''
	}

	try {
		const upload = new Upload();
		const prefix = 'bands';

		if (body.logo != '' && body.image_ori_logo) {
			images.logo = await upload.uploadToCloud(body.image_ori_logo, prefix, `${payload.band_slug}-logo`);
		}
		if (body.thumbnail != '' && body.image_ori_thumbnail) {
			images.thumbnail = await upload.uploadToCloud(body.image_ori_thumbnail, prefix, `${payload.band_slug}-thumbnail`);
		}
		if (body.image_banner != '' && body.image_ori_banner) {
			images.banner = await upload.uploadToCloud(body.image_ori_banner, prefix, `${payload.band_slug}-banner`);
		}

		return {
			payload, images
		}

	} catch (err) {
		console.log('error while upload cloudinary', err)
	}
}
