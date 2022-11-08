const router = express.Router();

router.get('/', async (req, res, next) => {
    var obj = { 
        error: null, 
        js: ['contact'],
        data: {
            breadcrumb: [
                {link: '#', text: 'Kontak Kami'}
            ],
            pageTitle: 'Kontak Kami',
            action: '/contact',
            successPostMessage: null
        }
    };

    if (req.query.json == '1') {
        return res.json(obj)
    }
  
    return res.render('front/contact', obj)
});

router.post('/', async (req, res, next) => {
    var obj = { 
        error: null, 
        data: {
            breadcrumb: [
                {link: '#', text: 'Kontak Kami'}
            ],
            pageTitle: 'Kontak Kami',
            action: '/contact',
            successPostMessage: 'Data anda berhasil tersimpan, akan kami respons segera'
        },
        
    };

    const payload = cleanPost(req.body);

    try {
        res.locals.contactModel.create(payload)
        return res.render('front/contact', obj)
    } catch (err) {
        console.error('im error', err)
        obj.error = err.message;
        return res.render('front/contact', obj)
    }  
})

module.exports = router

function cleanPost(body) {
    return {
        ct_name: body.name.trim(),
        ct_hp: body.hp.trim(),
        ct_email: body.email.trim(),
        ct_message: body.message.trim()
    }
}

