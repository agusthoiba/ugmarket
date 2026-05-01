const express = require('express');
const { result } = require('underscore');
const router = express.Router();
const multer = require('multer');

const { collectionsSchema } = require("../../models/schema");
const validate = require("../../middleware/validate");
// Configure multer for file uploads
const uploadMulter = multer({ dest: '/tmp/upload' }); // Store files in /tmp/upload

function authCheckSession(req, resp, next) {
  if (req.session && !req.session.user_admin) {
	console.log('redirect to login')
	return resp.redirect('/admin/auth/login');			
  }

  return next();
}

async function cleanPayload(body) {
  let result = {}

  if (body.col_name) {
    result.col_name = (body.col_name).trim();
    result.col_slug = slug((body.col_name).toLowerCase());
  }
  if (body.col_desc) {
    result.col_desc = (body.col_desc).trim();
  }
  if (body.col_banner_isdisplay_home != null) {
    result.col_banner_isdisplay_home = body.col_banner_isdisplay_home != null ? 1 : 0;
  }
  if (body.col_is_visible != null) {
    result.col_is_visible = body.col_is_visible != null ? 1 : 0;
  }
  if (body.col_sort) {
    result.col_sort = parseInt(body.col_sort);
  }

  if (body.col_thumbnail) {
    result.col_thumbnail = body.col_thumbnail || ''
  }
  return result;
}


async function uploadFile(locals, file) {
  let filename = '';
  if (file) {
    var current_time = (new Date()).valueOf().toString();
    fileName = `${result.col_slug}_${current_time}`;
    
    try {
      console.log('Uploading to Cloudinary...');
      await locals.uploadCloudinary.uploadToCloud(file.path, "", fileName);

    } catch (err) {
      console.log('[ERROR][CLEANPOST_UPLOAD] in prod ', err)
      return err;
    }
	}
  return fileName
}

// Create a new collection
router.post('/', authCheckSession, uploadMulter.single('col_thumbnail_file'), validate(collectionsSchema), async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  try {
    if (req.file) {
      req.body.col_thumbnail = await uploadFile(res.locals, req.file)
    }

		const payload = await cleanPayload(req.body);

    const newCollection = await res.locals.collectionModel.create(payload);
    
    res.status(201).json(newCollection);
  } catch (error) {
		console.error(error)
    res.status(400).json({ error: error.message });
  }
});

// Read all collections
router.get('/', authCheckSession, async (req, res) => {
	var obj = { 
		error: null, 
		data: {
			bands: []
		}
	};
  try {
    const collections = await res.locals.collectionModel.find({});
		console.log('collections:'	, collections)

    collections.map( (col) => {
      if (col.col_thumbnail) {  
        col.col_thumbnail = req.app.locals.cloudinary.url(col.col_thumbnail,  {width: 100, height: 100});
      }
      return col
    })

		if (req.query.json == '1') {
			return res.status(200).json(collections);
		}
		return res.render('admin/collections', obj);
  } catch (error) {
		if (req.query.json == '1') {
			return res.status(500).json({ error: error.message });
		}
		obj.error = error.message;
		return res.render('admin/collections', obj);
  }
});

// Read a single collection by ID
router.get('/:id', authCheckSession, async (req, res) => {
  try {
    const collection = await res.locals.collectionModel.findOne({col_id: req.params.id});
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a collection
router.put('/:id', authCheckSession, uploadMulter.single('col_thumbnail_file'), async (req, res) => {
  try {
		delete req.body.col_id;
    if (req.file) {
      req.body.col_thumbnail = await uploadFile(res.locals, req.file)
    }
		const payload = await cleanPayload(req.body);

    const updated = await res.locals.collectionModel.update({ col_id: req.params.id }, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a collection
router.delete('/:id', authCheckSession, async (req, res) => {
  try {
    const deleted = await res.locals.collectionModel.softDelete({ col_id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

