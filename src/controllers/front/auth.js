const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');

const { validate, ValidationError, Joi } = require('express-validation')

const { getFbAccessToken, graphApiGet } = require('../../helpers/facebookApi');

router.get('/login', function (req, res, next) {
  const objView = {
    error: null, data: {
      urlActive: req.path,
      isUrlActive: req.path === '/login',
      action: '/auth/login'
    }
  };
  return res.render('front/auth', objView);
});

router.get('/register', function (req, res, next) {
  const objView = {
    error: null, data: {
      urlActive: req.path,
      isUrlActive: req.path === '/register',
      action: '/auth/register'
    }
  };
  return res.render('front/auth', objView);
});

router.get('/login/facebook', function (req, res, next) {
  const fbConfig = req.app.locals.config.facebook;
  const url = `${fbConfig.appOauthUrl}?client_id=${fbConfig.appId}&redirect_uri=${fbConfig.appRedirectUri}`;
  // &state={"{st=state123abc,ds=123456789}"}`
  return res.redirect(url)
})

router.get('/login/callback', async (req, res, next) => {
  const fbConfig = req.app.locals.config.facebook;
  const clientFb = {
    id: fbConfig.appId,
    secret: fbConfig.appClientSecret
  }
  const responseToken = await getFbAccessToken(fbConfig.graphBaseUrl, clientFb, fbConfig.appRedirectUri, req.query.code);
  const getMe = await graphApiGet(fbConfig.graphBaseUrl, '/me', responseToken.data.access_token)

  const filter = {
    user_facebook_id: getMe.data.id
  };

  let findUser = await res.locals.userModel.findOne(filter)
  if (!findUser) {
    const payload = {
      user_facebook_id: getMe.data.id,
      user_name: getMe.data.name,
      user_created_at: moment().format('YYYY-MM-DD HH:mm:ss')
    };

    if (getMe.data.email) {
      payload.user_email = getMe.data.email;
    }

    const createUser = await res.locals.userModel.create(payload);
    findUser = createUser.get({
      plain: true
    });
  }

  var userData = {
    id: findUser.user_id
  }

  authSession(req, userData);

  return res.redirect('/');
});

router.post('/register', async (req, res, next) => {
  var obj = { 
    error: null, 
    data: {
      urlActive: req.path,
      isUrlActive: req.path === '/register',
      action: '/auth/register'
    }
  };

  req.assert('email', 'required').notEmpty();
  req.assert('email', 'valid email required').isEmail();
  req.assert('password', 'password must be 4 to 20 characters required').len(4, 20);

  var errValidate = req.validationErrors();

  if (errValidate) {
    var errorMsg = '';
    errValidate.forEach(function (item) {
      errorMsg += item.msg + '\n';
    });

    obj.error = errorMsg;

    return res.render('front/auth', obj);
  }

  if (req.body.password !== req.body.confirm_password) {
    obj.error = 'Password confirmation does not match password';
    return res.render('front/auth', obj);
  }

  const filter = {
    user_email: req.body.email,
  };

  const findUser = await res.locals.userModel.findOne(filter);
  if (findUser) {
    obj.error = 'Email already registered';
    return res.render('front/auth', obj);
  }

  const payload = {
    user_email: req.body.email,
    user_password: crypto.createHash('sha1').update(req.body.password).digest("hex"),
    user_created_at: moment().format('YYYY-MM-DD HH:mm:ss')
  }

  const docCreate = await res.locals.userModel.create(payload)

  var userData = {
    id: docCreate.user_id,
    email: docCreate.user_email
  }

  authSession(req, userData);
  return res.redirect('/');
});


router.post('/login', async function (req, res, next) {
  var obj = { error: null, data: null };

  var query = {
    user_email: req.body.email,
    user_password: crypto.createHash('sha1').update(req.body.password).digest("hex")
  };

  const findUser = await res.locals.userModel.findOne(query)

  if (!findUser) {
    obj.error = 'Username and password is totally wrong. \n Please try again!';
    obj.data = {
      urlActive: req.path,
      isUrlActive: req.path === '/login',
      action: '/auth/login'
    }

    return res.render('front/auth', obj);
    // return res.json(obj);
  }

  const userData = {
    id: findUser.user_id,
    email: findUser.user_email
  }

  authSession(req, userData);

  obj.data = findUser;
  return res.redirect('/');
});

router.get('/logout', function (req, res, next) {
  if (req.session.hasOwnProperty('user')) {
    req.session.user = null;
    req.session.save();
    res.clearCookie('user');
  }
  res.redirect('/');
});

function authSession(req, user) {
  req.session.login_type = 'frontend';
  req.session.user = user;

  return;
}

module.exports = router;