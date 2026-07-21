const router = express.Router();

router.get('/', async (req, res, next) => {
    var obj = { 
        error: null, 
        data: {
            breadcrumb: [
                {link: '#', text: 'Tentang Kami'}
            ],
            pageTitle: 'Tentang Kami | Undergroundsync',
            pageDescription: 'Pelajari lebih lanjut tentang Undergroundsync, toko merchandise musik yang menyediakan berbagai produk dari band favorit kamu.',
            pageKeywords: 'Undergroundsync, tentang kami, merchandise musik, toko merchandise'
        }
    };
  
  return res.render('front/about', obj)
})

module.exports = router
