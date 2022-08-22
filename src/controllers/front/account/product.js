var router = express.Router()

const URI = require("urijs");

var Product = require('../../../models/product')
var Category = require('../../../models/category')
var Band = require('../../../models/band')
// var User = require(config.base_dir + '/models/user');

var fs = require('fs.extra');
var crypto = require('crypto');
const promisify = require('util').promisify
const copyFile = promisify(fs.copyFile)
const moment = require('moment')
const Upload = require('../../../helpers/uploadCloudinary');
const { SIZES } = require('../../../constant');

router.get('/', async (req, res, next) => {
  var userId = parseInt(req.session.user.id)

  var obj = {
    error: null,
    data: {
      products: []
    }
  }

  var query = { prod_user_id: userId, prod_is_deleted: 0 }
  // var options = { sort: { prod_created_at: 'desc' } };

  const doc = await res.locals.productModel.find(query, {});
  
  if (doc.length > 0) {
      obj.data.products = doc.map(val => {
        val.is_visible = val.prod_is_visible == 1
        const imgs = val.prod_images.split(',');
        val.thumbnail = req.app.locals.cloudinary.url(imgs[0], {width: 100, height: 100, crop: "thumb"});

        return val
      })
    }

  if (req.query.json == '1') {
    return res.json(obj);
  }

  return res.render('front/account/product_list', obj)
})

router.get('/edit/:id', async (req, res, next) => {
  var userId = req.session.user.id;
  const prodId = parseInt(req.params.id)

  var obj = {
    error: null, 
    data: {
      item: {},
      categories: [],
      bands: [],
      sizes: SIZES
    },
    action: `/account/product/update/${prodId}`,
    js: ['account_product']
  };

  try {
    const product = await res.locals.productModel.findOne({ prod_id: prodId, prod_user_id: userId })

    obj.data.item = {
      id: product.prod_id,
      name: product.prod_name,
      category: product.prod_cat_id,
      band: product.prod_band_id,
      images: [],
      thumbnails: [],
      price: product.prod_price,
      weight: product.prod_weight,
      desc: product.prod_desc,
      marketplace_tokopedia: product.prod_marketplace_tokopedia_path == null ? '' : `https://www.tokopedia.com${product.prod_marketplace_tokopedia_path}`,
      marketplace_bukalapak: product.prod_marketplace_bukalapak_path == null ? '' : `https://www.bukalapak.com${product.prod_marketplace_bukalapak_path}`,
      is_visible: product.prod_is_visible == 1,
      sizes: req.app.locals.strToArr(product.prod_sizes, ','),
      condition: product.prod_condition,
      stock: product.prod_stock,
      created_at: product.prod_created_at
    }

    let mps = [];
    if (product.prod_marketplaces && product.prod_marketplaces.length > 0) {
      mps = product.prod_marketplaces;
      for(let i = 0; i < mps.length; i++) {
        obj.data.item.marketplaces[mps[i].name] = mps[i].url
      }
    }

    if (product.prod_images && product.prod_images != null) {
      const thumbs = req.app.locals.strToArr(product.prod_images, ',')

      obj.data.item.thumbnails = thumbs.map(val => {
        return req.app.locals.cloudinary.url(val, {width: 100, height: 100, crop: "thumb"});
      });
    }

    obj.data.categories = await res.locals.categoryModel.find()
    obj.data.bands = await res.locals.bandModel.find({}, {
      page: 1,
      limit: 20
    })

    if (req.query.json == '1') {
      return res.json(obj);
    }

    return res.render('front/account/product_form', obj);
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while load your product';
    if (req.query.json == '1') {
      return res.json(obj);
    }
    return res.render('front/account/product_form', obj);
  }

})

router.post('/update/:id', async function (req, res, next) {
  const prodId = parseInt(req.params.id)

  const query = {
    prod_id: prodId
  }

  var obj = { error: null, data: null };

  try {
    const payload = await cleanPost(req.body, res, 'update')
    const docUpd = await res.locals.productModel.update(query, payload)

    return res.redirect('/account/product');
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while update your product';
    //if (req.query.json == '1') {
    return res.json(obj);
    // }
    // return res.render('front/account/product_form', obj);
  }
})

router.get('/add', async (req, res, next) => {
  var obj = {
    error: null,
    data: {},
    action: '/account/product/create',
    js: ['account_product']
  };

  obj.data = {
    categories: await res.locals.categoryModel.find(),
    bands:  await res.locals.bandModel.find(),
    sizes: SIZES,
    item: itemData()
  }
  
  if (req.query.json == '1') {
    return res.json(obj);
  }
  return res.render('front/account/product_form', obj);
})

router.post('/create', async (req, res) => {
  var obj = { error: null, data: null };

  req.body.user_id = req.session.user.id;

  const payload = await cleanPost(req.body, res);

  console.log('payload', payload)

  await res.locals.productModel.create(payload)
  return res.redirect('/account/product');
})

module.exports = router;

function itemData() {
  return {
    name: '',
    category: '',
    description: '',
    price: 0,
    size: '',
    sizes: [],
    weight: 0,
    stock: 1,
    images: [],
    thumbnails: [],
    band: '',
    marketplaces: {
      tokopedia: '',
      bukalapak: '',
      shopee: ''
    },
  }
}

/*function validate(req) {
    req.assert('name').notEmpty().len(2, 150);
    req.assert('category').notEmpty();
    req.assert('price').notEmpty();

    var errVal = [];
    if (req.validationErrors()) {
        var error = req.validationErrors();
        for (var i in error) {
            errVal.push(error[i].param + ' ' + error[i].msg);
        }
    }

    return errVal;
}*/

async function cleanPost(body, res, tipe = 'create') {
  const findBand = await res.locals.bandModel.findOne({
    band_id: body.band
  });

  console.log('findBand --', findBand)

  const prodSlug = `${findBand.band_slug}-${body.name.trim().toLowerCase()}`

  var payload = {
    prod_name: body.name.trim(),
    prod_slug: slug(prodSlug),
    prod_cat_id: body.category,
    prod_desc: body.description.trim(),
    prod_price: parseInt(body.price),
    prod_weight: parseInt(body.weight),
    prod_condition: body.condition,
    prod_stock: parseInt(body.stock),
    prod_band_id: body.band,

    prod_is_visible: body.is_visible == 'publish' ? 1 : 0,
    prod_sizes: body.sizes ? body.sizes.join() : ''
  }

  if (tipe == 'create') {
    payload = Object.assign(payload, {
      prod_user_id: parseInt(body.user_id),
      prod_created_at: moment().format('YYYY-MM-DD HH:mm:ss')
    })
  }

  if (body.marketplace_tokopedia) {
    const uriTokped = new URI((body.marketplace_tokopedia).trim());
    payload.prod_marketplace_tokopedia_path = uriTokped.path();
  }

  if (body.marketplace_bukalapak) {
    const uriBukalapak = new URI((body.marketplace_bukalapak).trim());
    payload.prod_marketplace_bukalapak_path = uriBukalapak.path();
  }

  if (body.image_ori) {
    if (typeof body.image_ori == 'string') {
      body.images = [body.image_ori];
    }

    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    var randomName = crypto.createHash('sha1').update(current_date + random).digest('hex');
    var fileName = payload.prod_slug;

    const upload = new Upload();
    try {
      const oris = await upload.processMultipleUpload(body.images, 'products', fileName);
      payload.prod_images = oris.join(',')

      return new Promise(resolve => {
        return resolve(payload)
      })
    } catch (err) {
      return new Promise((resolve, reject) => {
        return reject(err)
      })
    }
  }

  return new Promise((resolve, reject) => {
    return resolve(payload)
  })

  /*async.parallel({
      img: function(cbPar) {
          async.forEachOf(body.image_ori, function(val, k, cb) {
              var filePathName = 'product/original/' + fileName;
              upload.createImageBase64(val, 'product/original/' + fileName, function(err, img) {
                  if(err) return cb(err);

                  payload.image.push(img.url);
                  copyResize(img.path, fileName+'.'+img.ext).then(function(doc){
                      cb();
                  }, function(err) {
                      return cb(err);
                  })
              })
          }, function(err) {
              if (err) return cbPar(err)

              return cbPar(null, payload);
          })
      },
      thumb: function(cbPar){
          async.forEachOf(body.image_thumbnail, function(val, k, cb) {
              upload.createImageBase64(val, 'product/thumbnail/' + fileName, function(err, img) {
                  if(err) return cb(err);

                  payload.thumbnail.push(img.url);
                  cb();
              })
          }, function(err) {
              if (err) return cbPar(err)

              return cbPar(null, payload);
          })
      }
  }, function(err, results) {
      if (err) return fn(err)
      return fn(null, payload);
  })*/
}

async function uploadImageBase(path, val, fileName) {
  let imgUrls = []
  const filePathName = path + fileName;
  let img

  try {
    img = await upload.createImageBase64(val, filePathName)
  } catch (err) {
    console.error('err in uploadImageBase', err);
    return new Promise((resolve, reject) => {
      return reject(err)
    })
  }

  try {
    if (path == 'product/original/') {
      const resize = await copyResize(img.path, fileName + '.' + img.ext)
    }
  } catch (err) {
    return new Promise((resolve, reject) => {
      return reject(err)
    })
  }

  return fileName + '.' + img.ext
}

async function processMultipleUpload(path, images, filename) {
  let imgs = []
  console.log('images, filename', images, filename)
  try {
    for (let image of images) {
      const img = await uploadImageBase(path, image, filename)
      // console.log('img upload base', img)
      imgs.push(img)
    }
    console.log('imgss')
    return new Promise((resolve, reject) => {
      return resolve(imgs)
    })
  } catch (err) {
    return new Promise((resolve, reject) => {
      return reject(err)
    })
  }
}

/*async function copyResize(src, name) {
    var destLarge = config.file_dir + 'product/large/'+ name;
        
    let fileLarge
    let fileMedium

    try {
        await copyFile(src, destLarge)
    } catch (err) {
        return err
    }

    try {
        fileLarge = await upload.resize(destLarge, 500, 1000)
    } catch (err) {
        return err
    }
    
    return fileLarge
}*/


async function copyResize(src, name) {
  try {
    const destLarge = config.file_dir + 'product/large/' + name
    await copyFile(src, destLarge)
    const imgLarge = await upload.resize(src, destLarge, 500, 1000)

    // const destMedium = config.file_dir + 'product/medium/'+ name
    // await copyFile(src, destMedium, {replace: false})

    // const imgMedium = await upload.resize(destMedium, 300, 600)
    return { l: imgLarge }
    //m: imgMedium
  } catch (err) {
    return new Promise((resolve, reject) => {
      return reject(err)
    })
  }

}

function getCategory(categoryModel) {
  return new Promise((resolve, reject) => {
    categoryModel.find({}, {}).then(doc => {
      return resolve(doc);
    }, err => {
      return reject(err);
    });
  })
}

function getBand() {
  let query = {}
  let option = {
    order: [
      ['band_name', 'asc']
    ]
  }

  return new Promise((resolve, reject) => {
    Band.find(query, option).then(doc => {
      return resolve(doc);
    }, err => {
      return reject(err);
    });
  })
}

async function getSyncData(catModel, bandModel) {
  let result = {
    categories: await getCategory(catModel),
    bands: await getBand(bandModel)
  }
  return result;
};
