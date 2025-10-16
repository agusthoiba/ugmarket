var router = express.Router();

const territoryIndonesia = require('territory-indonesia');

const { profileSchema } = require("../../../models/schema");
const validate = require("../../../middleware/validate");
const Upload = require('../../../helpers/uploadCloudinary');
const { zip } = require('underscore');

router.get('/', async function (req, res, next) {
  var obj = {
    error: null,
    data: null,
    js: ['account_profile'],
    message: null
  };
  var userId = req.session.user.id;

  try {
    const user = await res.locals.userModel.findOne({ user_id: userId })

    user.user_avatar = req.app.locals.cloudinary.url(user.user_avatar, {width: 100, height: 100, crop: "thumb"});
    delete user.user_password;

    obj.data = { 
      user: user
    };

    if (req.query.json == '1') {
      return res.status(200).json(obj);
    }

    if (req.query.message != undefined && req.query.message != '') {
      obj.message = req.query.message;
    }

    return res.render('front/account/profile', obj);

  } catch (err) {
    obj.error = 'An Error occured while load profile';
    console.error(err);
    return res.render('error', obj);
  }

});

// validate(profileSchema), 
router.post('/update', async function (req, res, next) {
  var obj = { error: null, data: null, ok: false, message: null };
  var userId = req.session.user.id

  const payload = await cleanPost(req.body, userId);
  
  try {
    await res.locals.userModel.update({ user_id: userId }, payload);

    obj.ok = true;
    obj.message = 'Profile updated successfully';
    return res.redirect('/account/profile?message=' + encodeURIComponent(obj.message) );
  } catch (err) {
    console.error(err);
    obj.error = 'Ada kesalahan saat memperbarui profil Anda';
    return res.render('front/account/profile', obj);
  }

});

module.exports = router;

async function cleanPost(body, userId) {
  var payload = {
    user_name: body.name.trim(),
    user_hp: body.hp.trim(),
    user_gender: body.gender
  }
  
  if (body.province) {
    payload.user_address_province_id = parseInt(body.province);
  }

  if (body.city) {
    payload.user_address_city_id = parseInt(body.city);
  }

  if (body.district) {
    payload.user_address_district_id = parseInt(body.district);
  }

  if (body.village) {
    payload.user_address_village_id = parseInt(body.village);
  }

  if (body.street) {
    payload.user_address_street = body.street.trim();
  }

  if (body.zipcode) {
    payload.user_address_zipcode = body.zipcode.trim();
  }

  if (body.image_ori_avatar) {
    try {
      const upload = new Upload();
      const timestamp = (Date.now()).valueOf();
      const fileName = `profile-${userId}_${timestamp}`;
      await upload.uploadToCloud(body.image_ori_avatar, '', fileName);

      payload.user_avatar = fileName;
      return payload;
    } catch (err) {
      console.log('[ERROR][CLEANPOST_UPLOAD] in prod ', err)
      return err;
    }
  }

  return payload;
}
