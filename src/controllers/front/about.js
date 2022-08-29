const router = express.Router();

router.get('/', async (req, res, next) => {
    var obj = { 
        error: null, 
        data: {
            breadcrumb: [
                {link: '#', text: 'Tentang Kami'}
            ],
            pageTitle: 'Tentang Kami'
        }
    };
  
  return res.render('front/about', obj)
})

module.exports = router
