const router = express.Router();

router.get('/', async (req, res, next) => {
    var obj = { 
        error: null, 
        data: {
            breadcrumb: [
                {link: '#', text: 'Kontak Kami'}
            ],
            pageTitle: 'Kontak Kami'
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
            pageTitle: 'Kontak Kami'
        }
    };
  
  return res.render('front/contact', obj)
})

module.exports = router
