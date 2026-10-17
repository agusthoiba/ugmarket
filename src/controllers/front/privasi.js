const router = express.Router();

router.get('/', async (req, res, next) => {
    var obj = {
        error: null,
        data: {
            breadcrumb: [
                { link: '#', text: 'Kebijakan Privasi' }
            ],
            pageTitle: 'Kebijakan Privasi'
        }
    };

    return res.render('front/privasi', obj)
})

module.exports = router
