const router = express.Router();
const crypto = require('crypto');
const { getFbAccessToken, inspectFbToken } = require('../../helpers/facebookApi') ;

router.get('/login', function (req, res, next) {
    const objView = { error: null, data: null };
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
    const response = await getFbAccessToken(fbConfig.graphBaseUrl, clientFb, fbConfig.appRedirectUri, req.query.code);
    return res.json(response.data);
});

router.post('/login', function (req, res, next) {
    var obj = { error: null, data: null };

    req.assert('email', 'required').notEmpty();
    req.assert('email', 'valid email required').isEmail();
    req.assert('password', 'password must be 4 to 20 characters required').len(4, 20);

    obj.data = {email: req.body.email.trim()};
    
    var errValidate = req.validationErrors();

    if (errValidate) {
        console.error(errValidate);
        
        var errorMsg = '';
        errValidate.forEach(function(item){
            errorMsg += item.msg + '\n';
        });

        obj.error = errorMsg;

        return res.json(obj);
    }

    var query = {user_email: obj.data.email};
    return res.locals.userModel.findOne(query).then(doc => {
        let payload = {
            user_email: obj.data.email,
            user_password: crypto.createHash('sha1').update(req.body.password).digest("hex")
        }

        if (!doc) {
            user.create(payload).then(docCreate => {
                var docUserJson = docCreate.toJSON()

                var userData = {
                    id: docUserJson.user_id,
                    email: docUserJson.user_email
                }

                authSession(req, userData);

                obj.data = userData;
                return res.json(obj);
            }, err => {
                console.error(err);
                obj.error = 'An error occured while login or register. Please try again!';
                return res.json(obj);
            });
        } else {
            query.user_password = crypto.createHash('sha1').update(req.body.password).digest("hex");

            res.locals.userModel.findOne(query).then(docLogin => {
                if (!docLogin) {
                    obj.error = 'Username and password is totally wrong. Please try again!';
                    return res.json(obj);
                }

                docLogin = docLogin.toJSON()
                var userData = {
                    id: docLogin.user_id,
                    email: docLogin.user_email
                }
                
                authSession(req, userData);
                obj.data = docLogin;
                return res.json(obj);
            }, err => {
                obj.error = 'An error occured while login or register. Please try again!';
                return res.json(obj);
            });
        }
    }, err => {
        obj.error = 'An error occured while login or register. Please try again!';
        return res.json(obj);
    });
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
    console.log('im here', req.session)
    req.session.login_type = 'frontend';
    req.session.user = user;
    req.session.save();

    console.log(req.session.cookie)
    
    return;
}

module.exports = router;