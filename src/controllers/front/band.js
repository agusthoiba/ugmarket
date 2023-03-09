

const router = express.Router()
const URI = require("urijs");
const { Op } = require("sequelize");
const { PRODUCT_SORT } = require('../../constant');
const pagination = require('../../helpers/pagination');
const config = require('../../config');

router.get('/', async (req, res, next) => {

  let obj = {
    error: null,
    // js: ['band_list'],
    data: {
      breadcrumb: [
        {link: '#', text: 'bands'}
      ],
      pageTitle: 'Bands',
      // categories: req.app.locals.categories,
      bands: [],
      imageBaseUrl: config.file_host,
      pagination: {
        limit: 20,
        page: req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1,
        total_page: 1,
        total: 0,
        list: []
      },
      uri: {
        path: '',
        params: '',
        query: {}
      },
      // sort: PRODUCT_SORT,
      sizes: req.app.locals.sizes
    }
  }

  var url = new URI(req.originalUrl);

  obj.data.uri.query = url.query();
  const maxLinkPagination = 5 // maximal number of link pagination

  let query = {
    band_enabled: 1
  }

  var options = { 
    sort: [['band_slug', 'ASC']],
    page: obj.data.pagination.page,
    limit: obj.data.pagination.limit
  }

  try {
    const bandTotal = await res.locals.bandModel.count(query);

    obj.data.pagination.total = bandTotal;
    obj.data.pagination = pagination(obj.data.bands, obj.data.pagination.limit, obj.data.pagination.page);

    if (bandTotal > 0) {
      const doc = await res.locals.bandModel.find(query, options);

      obj.data.bands = doc.map(val => {
        /* let thumbnail = '/image/no-image-180x180.png'
        if (val.prod_images != null) {
          let thumbArr = val.prod_images.split(',');
          thumbnail = req.app.locals.cloudinary.url(thumbArr[0],{width: 220, height: 220, crop: 'thumb'});
        } */

        const datum = Object.assign({}, 
          val,
          { 
            thumbnail: req.app.locals.cloudinary.url(`bands/${val.band_slug}-thumbnail.jpg`, {width: 245, height: 245})
          }
        )

        // datum.prod_price = req.app.locals.currency(datum.prod_price).format('$0,0')

        return datum
      })
    }

    if (req.query.json == '1') {
      return res.json(obj);
    }

    return res.render('front/band_list', obj)
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while load your band'

    if (req.query.json == '1') {
      return res.json(obj);
    }

    return res.render('front/band_list', obj)
  }
});

module.exports = router
