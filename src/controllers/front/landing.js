const router = express.Router();

const content = require('../../data/content');


router.get('/', async (req, res, next) => {
    var obj = {
        error: null,
        js: ['landing'],
        data: {
            breadcrumb: [
                { link: '#', text: 'Daftar merchandise Undergroundsync' }
            ],
            pageTitle: 'Daftar merchandise Undergroundsync',
            ...content,
            status: req.query.status || null,
            year: new Date().getFullYear(),
        }
    };

    if (req.query.json == '1') return res.json(obj)

    return res.render('front/landing', obj)
})

module.exports = router
