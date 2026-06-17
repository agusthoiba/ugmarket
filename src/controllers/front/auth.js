const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');

const validate = require("../../middleware/validate");
const { getFbAccessToken, graphApiGet } = require('../../helpers/facebookApi');
const { getGoogleAccessToken, getGoogleUserInfo } = require('../../helpers/googleApi');

const { registerSchema } = require("../../models/schema");
const Email = require('../../connectors/email');

router.get('/login', function (req, res, next) {
  const objView = {
    error: null, 
    data: {
      urlActive: req.path,
      isUrlActive: req.path === '/login',
      action: '/auth/login',
      cfKey: req.app.locals.config.cloudflare.siteKey,
      redirect: req.query.redirect || ''
    },
    message: null
  };

  if (req.query.message != undefined && req.query.message != '') {
    objView.message = req.query.message;
  }

  return res.render('front/auth_login', objView);
});

router.get('/register', function (req, res, next) {
  const objView = {
    error: null, 
    data: {
      urlActive: req.path,
      isUrlActive: req.path === '/register',
      action: '/auth/register',
      cfKey: req.app.locals.config.cloudflare.siteKey
    },
    js: ['auth_register']
  };
  
  return res.render('front/auth_register', objView);
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


router.get('/login/google', function (req, res, next) {
  const gConfig = req.app.locals.config.google.oauth;
  const params = new URLSearchParams({
    client_id: gConfig.clientId,
    redirect_uri: gConfig.redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'online'
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/login/google/callback', async (req, res, next) => {
  const gConfig = req.app.locals.config.google.oauth;
  const client = { id: gConfig.clientId, secret: gConfig.clientSecret };

  const tokenResponse = await getGoogleAccessToken(client, gConfig.redirectUri, req.query.code);
  const userInfo = await getGoogleUserInfo(tokenResponse.data.access_token);
  const profile = userInfo.data;

  let findUser = await res.locals.userModel.findOne({ user_google_id: profile.sub });

  if (!findUser && profile.email) {
    findUser = await res.locals.userModel.findOne({ user_email: profile.email });
    if (findUser) {
      await res.locals.userModel.update({ user_id: findUser.user_id }, { user_google_id: profile.sub });
    }
  }

  if (!findUser) {
    const payload = {
      user_google_id: profile.sub,
      user_name: profile.name,
      user_is_verified: 1,
      user_created_at: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    if (profile.email) payload.user_email = profile.email;

    const createUser = await res.locals.userModel.create(payload);
    findUser = createUser.get({ plain: true });
  }

  authSession(req, { id: findUser.user_id });
  return res.redirect('/');
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  var obj = { 
    error: null, 
    data: {
      urlActive: req.path,
      isUrlActive: req.path === '/register',
      action: '/auth/register',
      cfKey: req.app.locals.config.cloudflare.siteKey
    }
  };

  if (req.body.password !== req.body.confirm_password) {
    obj.error = 'Konfirmasi password tidak sesuai dengan password';

    return res.status(400).json(obj)
  }

  const filter = {
    user_email: req.body.email,
  };

  const findUser = await res.locals.userModel.findOne(filter);
  if (findUser) {
    obj.error = 'Email sudah terdaftar';
    return res.status(409).json(obj)
  }

  const verifyToken = crypto.randomBytes(32).toString('hex');

  const payload = {
    user_name: (req.body.name).trim(),
    user_email: req.body.email,
    user_password: crypto.createHash('sha512').update(req.body.password).digest("hex"),
    user_verify_token: verifyToken,
    user_created_at: moment().format('YYYY-MM-DD HH:mm:ss')
  }

  const docCreate = await res.locals.userModel.create(payload)

  const appConfig = req.app.locals.config;
  const verifyUrl = `${appConfig.domain}/auth/verify/${verifyToken}`;
  const emailClient = new Email(appConfig.resend.apiKey);

  emailClient.send({
    from: appConfig.resend.from,
    to: docCreate.user_email,
    subject: 'Verifikasi Email Kamu - Lapak Undergroundsync',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Selamat Datang di Lapak Undergroundsync, ${docCreate.user_name}! 🤘</h2>
        <p>Terima kasih sudah mendaftar. Satu langkah lagi — verifikasi email kamu untuk mulai berjualan dan berbelanja.</p>
        <p style="margin:32px 0">
          <a href="${verifyUrl}"
             style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold">
            Verifikasi Email
          </a>
        </p>
        <p style="color:#666;font-size:13px">Link ini hanya berlaku selama 24 jam. Jika kamu tidak mendaftar di Lapak Undergroundsync, abaikan email ini.</p>
      </div>
    `
  }).catch(err => console.error('Email verification send error:', err));

  var userData = {
    id: docCreate.user_id,
    email: docCreate.user_email
  }

  authSession(req, userData);
  return res.redirect('/auth/login?message=Registrasi berhasil! Cek email kamu untuk verifikasi akun.');
});


router.get('/verify/:token', async (req, res, next) => {
  const findUser = await res.locals.userModel.findOne({ user_verify_token: req.params.token });

  if (!findUser) {
    return res.redirect('/auth/login?message=Link verifikasi tidak valid atau sudah kadaluarsa.');
  }

  await res.locals.userModel.update(
    { user_id: findUser.user_id },
    { user_is_verified: 1, user_verify_token: null }
  );

  return res.redirect('/auth/login?message=Email berhasil diverifikasi! Silakan login.');
});


router.post('/login', async function (req, res, next) {
  var obj = { error: null, data: null, message: null };

  var query = {
    user_email: req.body.email,
    user_password: crypto.createHash('sha512').update(req.body.password).digest("hex")
  };

  const findUser = await res.locals.userModel.findOne(query)

  if (!findUser) {
    obj.error = 'Email dan password salah 🤘';
    obj.data = {
      urlActive: req.path,
      isUrlActive: req.path === '/login',
      action: '/auth/login'
    }

    return res.render('front/auth_login', obj);
    // return res.json(obj);
  }

  if (!findUser.user_is_verified) {
    obj.error = 'Akun kamu belum diverifikasi. Cek email untuk link verifikasi.';
    obj.data = {
      urlActive: req.path,
      isUrlActive: req.path === '/login',
      action: '/auth/login'
    }

    return res.render('front/auth_login', obj);
  }

  const userData = {
    id: findUser.user_id,
    email: findUser.user_email,
    avatar: findUser.user_avatar ? req.app.locals.cloudinary.url(findUser.user_avatar, {
      width: 50, height: 50, crop: 'thumb'
    }) : null
  }

  authSession(req, userData);

  obj.data = findUser;

  // Redirect to the specified page if provided, otherwise go to account
  const redirectUrl = req.body.redirect || '/account/product';
  return res.redirect(redirectUrl);
});

router.get('/logout', function (req, res, next) {
  if (req.session.hasOwnProperty('user')) {
    req.session.user = null;
    //req.session.save();
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