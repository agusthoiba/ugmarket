'use strict'

var router = express.Router();
var crypto = require('crypto');

var User = require(config.base_dir + '/models/user');

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

    User.findOne(query).then(doc => {
        let payload = {
            user_email: obj.data.email,
            user_password: crypto.createHash('sha1').update(req.body.password).digest("hex")
        }

        if (!doc) {
            User.create(payload).then(docCreate => {
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

            User.findOne(query).then(docLogin => {
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
    req.session.login_type = 'frontend';
    req.session.user = user;
    req.session.save();

    
    return;
}

module.exports = router;