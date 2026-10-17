const pagination = require('../../helpers/pagination');
const Upload = require('../../helpers/uploadCloudinary');
const { getAllCountryFlags } = require('../../helpers/countryFlag');

var router = express.Router();

function authCheckSession(req, resp, next) {
  if (req.session && !req.session.user_admin) {
	console.log('redirect to login')
	return resp.redirect('/admin/auth/login');			
  }

  return next();
}

router.get('/', authCheckSession, async function (req, res, next) {
	var obj = { 
		error: null, 
		data: {
			bands: []
		},
		pagination: {}
	};


	let query = {};

	if (req.query.q) {
		const re = /^[A-Za-z0-9]+$/;
		const qtr = (req.query.q).trim();
		if (!re.test(qtr)) {
			obj.error = 'Harus alfanumerik';

			return res.render('admin/band_list', obj);
		}
		obj.data.q = qtr;
		// at the time only by band name
		query = {
			band_name: qtr
		}
	}

	const pageLimit = 100;
	let option = {
		limit: pageLimit,
		page: req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1,
	};

	try {
		const queryCount = Object.assign({}, query);
		const bandCount = await res.locals.bandModel.count(queryCount);

		if (bandCount > 0) {
			const bandsModel = await res.locals.bandModel.find(query, option);

			const currentPage = option.page;
			
			obj.data.bands = bandsModel.map(val => {
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
			
			const basePath = '/admin/band';
			const page = pagination(pageLimit, currentPage, bandCount, basePath);
		    Object.assign(obj, page)
		}

		//return res.json(obj)
		return res.render('admin/band_list', obj);
	} catch (err) {
	
		obj.error = 'An Error occured while load band list';
		console.error(err);
		//return res.json(obj)
		return res.render('admin/band_list', obj);
	}
});

router.get('/add', authCheckSession, async function (req, res, next) {
	var obj = { 
		error: null, 
		data: {
			band: {
				band_name: '',
				band_slug: '',
				band_thumbnail: '',
				logo: '',
				image: '',
				band_genre: '',
				band_desc: '',
				band_is_local: false,
				band_enabled: false
			},
			genres: await res.locals.genreModel.find(),
			countries: getAllCountryFlags(),
		},
		action: '/admin/band'
	};

	return res.render('admin/band_form', obj);
});

router.get('/edit/:id', authCheckSession, async function (req, res, next) {
	const bandId = parseInt(req.params.id, 10);

	var obj = { 
		error: null, 
		data: {
			band: {},
			genres: await res.locals.genreModel.find(),
			countries: getAllCountryFlags(),
		},
		action: `/admin/band/update/${bandId}`
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

	return res.render('admin/band_form', obj);
});

router.post('/', authCheckSession, async function (req, res, next) {
	var obj = { error: null, data: null};

	const { payload, images } = await cleanPost(req.body);

	// return res.json(payload)
	await res.locals.bandModel.create(payload);

	return res.redirect('/admin/band');
});

router.post('/update/:id', authCheckSession, async function (req, res, next) {
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
		band_country: body.country || '',
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
		
		// Handle thumbnail: support both file upload (via Cloudinary) and direct URL input
		if (body.image_ori_thumbnail && body.image_ori_thumbnail != '') {
			const thumbnailValue = body.image_ori_thumbnail.trim();
			
			if (thumbnailValue.startsWith('data:')) {
				// Base64 data from file upload - upload to Cloudinary
				images.thumbnail = await upload.uploadToCloud(thumbnailValue, prefix, `${payload.band_slug}-thumbnail`);
			} else if (thumbnailValue.startsWith('https://') || thumbnailValue.startsWith('http://')) {
				// Direct URL input - validate it's a secure HTTPS URL
				try {
					const parsedUrl = new URL(thumbnailValue);
					
					// Security: Only allow HTTPS URLs (reject plain HTTP)
					if (parsedUrl.protocol !== 'https:') {
						console.log('[WARN] Rejected non-HTTPS thumbnail URL:', parsedUrl.protocol);
					} else {
						// Validate it looks like an image URL (common image extensions)
						const imageExtensions = /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif)(\?.*)?$/i;
						if (imageExtensions.test(parsedUrl.pathname)) {
							images.thumbnail = thumbnailValue;
						} else {
							console.log('[WARN] Thumbnail URL does not have a recognized image extension:', parsedUrl.pathname);
							// Still accept it - user confirmed on frontend
							images.thumbnail = thumbnailValue;
						}
					}
				} catch (e) {
					console.log('[ERROR] Invalid thumbnail URL:', e.message);
				}
			}
		}
		
		if (body.image_banner != '' && body.image_ori_banner) {
			images.banner = await upload.uploadToCloud(body.image_ori_banner, prefix, `${payload.band_slug}-banner`);
		}

		// Assign images to payload if they exist
		if (images.logo) payload.band_logo = images.logo;
		if (images.thumbnail) payload.band_image = images.thumbnail;
		if (images.banner) payload.banner = images.banner;

		return {
			payload, images
		}

	} catch (err) {
		console.log('error while upload cloudinary', err)
	}
}
