const crypto = require('crypto');
const pagination = require('../../helpers/pagination');
const Upload = require('../../helpers/uploadCloudinary');

var router = express.Router();

router.get('/login', function (req, res, next) {
  if (req.session.user_admin) {
    return res.redirect('/admin/band');
  }

  const objView = {
    error: null,
    data: {
      urlActive: req.path,
      isUrlActive: req.path === '/login',
      action: '/admin/auth/login'
    }
  };
  return res.render('admin/login', objView);
});

router.post('/login', async function (req, res, next) {
  var obj = { error: null, data: null };

  var query = {
    user_admin_email: req.body.email,
    user_admin_password: crypto.createHash('sha512').update(req.body.password).digest("hex")
  };

  console.log('query:', query)
  const findUser = await res.locals.userAdminModel.findOne(query)

  if (!findUser) {
    obj.error = 'Username and password is totally wrong';
    obj.data = {
      urlActive: req.path,
      isUrlActive: req.path === '/login',
      action: '/admin/auth/login'
    }

    return res.render('admin/login', obj);
  }

  const userData = {
    id: findUser.user_admin_id,
    email: findUser.user_admin_email
  }

  authSession(req, userData);

  obj.data = findUser;
  return res.redirect('/admin/band');
});

router.get('/logout', function (req, res, next) {
  if (req.session.hasOwnProperty('user_admin')) {
    req.session.user_admin = null;
    //req.session.save();
    res.clearCookie('user_admin');
  }
  res.redirect('/admin/auth/login');
});

function authSession(req, user) {
  req.session.login_type = 'admin';
  req.session.user_admin = user;

  return;
}

module.exports = router;
