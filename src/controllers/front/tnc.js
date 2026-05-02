const router = express.Router();

router.get('/', async (req, res, next) => {
    var obj = {
        error: null,
        data: {
            breadcrumb: [
                { link: '#', text: 'Syarat & Ketentuan' }
            ],
            pageTitle: 'Syarat & Ketentuan'
        }
    };

    return res.render('front/tnc', obj)
})

module.exports = router
