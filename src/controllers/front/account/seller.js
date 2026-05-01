var router = express.Router()

const URI = require("urijs");

var crypto = require('crypto');
const { sellerSchema } = require("../../../models/schema");
const Upload = require('../../../helpers/uploadCloudinary');
const validate = require("../../../middleware/validate");

const itemData = (seller, cloudinary) => {
  const seller_avatar =  seller?.sel_avatar ? cloudinary.url(seller.sel_avatar, {width: 100, height: 100, crop: "thumb"}) : '';
  const seller_banner =  seller?.sel_banner ? cloudinary.url(seller.sel_banner, {width: 512, crop: "fill"}) : '';
  return {
    id: seller?.sel_id || 0,
    name: seller?.sel_name || '',
    phone: seller?.sel_phone || '',
    description: seller?.sel_description || '',
    avatar: seller_avatar,
    banner: seller_banner,
  }
}

router.get('/', async (req, res, next) => {
  const { sellerModel } = req.app.locals;

  const findSeller = await sellerModel.findOne({ sel_user_id: req.session.user.id });
  var obj = {
    error: null,
    message: null,
    data: {
      seller: itemData(findSeller || null, req.app.locals.cloudinary),
      user: {
        user_address_province_id: findSeller ? findSeller.sel_address_province_id : 0,
        user_address_city_id: findSeller ? findSeller.sel_address_city_id : 0,
        user_address_district_id: findSeller ? findSeller.sel_address_district_id : 0,
        user_address_village_id: findSeller ? findSeller.sel_address_village_id : 0,
        user_address_street: findSeller ? findSeller.sel_address_street : '',
        user_address_zipcode: findSeller ? findSeller.sel_address_zipcode : ''
      }
    },
    //action: '/account/product/create',
    js: ['account_seller', 'address']
  };
  console.log('heyyy!')
  
  if (req.query.json == '1') {
    return res.json(obj);
  }
  return res.render('front/account/seller_form', obj);

  //return res.render('front/account/gmaps', obj);
});

// 
router.post('/', validate(sellerSchema),  async (req, res, next) => {
  console.log('req.body: ', req.body);
  req.body.user_id = req.session.user.id;

  const payload = await cleanPost(req.body)
  const query = {
    sel_user_id: payload.sel_user_id
  }

  try {
    const result = await req.app.locals.sellerModel.upsert(query, payload);
    return res.json(result)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ada kesalahan saat menyimpan data penjual' });
  }
});

async function cleanPost(body) {
  console.log("body: ", body); //body
  let payload = {
    sel_user_id: parseInt(body.user_id),
    sel_name: (body.name || '').trim(),
    sel_phone: (body.hp || '').trim(),
    sel_description: (body.description || '').trim(),
    sel_address_province_id: parseInt(body.province) || 0,
    sel_address_city_id: parseInt(body.city) || 0,
    sel_address_district_id: parseInt(body.district) || 0,
    sel_address_village_id: parseInt(body.village) || 0,
    sel_address_zipcode: (body.zipcode || '').trim(),
    sel_address_street: (body.street || '').trim(),
    sel_created_at: Date.now('YYYY-MM-DD HH:mm:ss')
  }

  if (body.image_banner) {
    let bannerUrlClean = decodeURIComponent(body.image_banner)
    console.log("bannerUrlClean: ", bannerUrlClean)
    payload.sel_banner = (bannerUrlClean.split('/'))[(bannerUrlClean.split('/')).length - 1];
  }

  if (body.image_ori_avatar) {
    const upload = new Upload();
    const timestamp = (Date.now()).valueOf();
    const fileName = `seller-user${body.user_id}_${timestamp}`;
    await upload.uploadToCloud(body.image_ori_avatar, '', fileName);

    payload.sel_avatar = fileName;
  }

  console.log("payload:", payload); 
  return payload;
  
}

module.exports = router;
