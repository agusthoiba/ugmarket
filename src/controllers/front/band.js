

const router = express.Router()
const URI = require("urijs");
const pagination = require('../../helpers/pagination');
const config = require('../../config');

router.get('/', async (req, res, next) => {
  const pageLimit = 20;
  const currentPage = req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;

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
    page: currentPage,
    limit: pageLimit
  }

  try {
    const bandTotal = await res.locals.bandModel.count(query);

    if (bandTotal > 0) {
      const doc = await res.locals.bandModel.find(query, options);    

      obj.data.bands = doc.map(val => {
        const datum = Object.assign({}, 
          val,
          { 
            thumbnail: req.app.locals.cloudinary.url(`bands/${val.band_slug}-thumbnail.jpg`, {width: 245, height: 245})
          }
        )

        return datum
      })


      const currentPage = options.page;
      const basePath = '/bands';
      const page = pagination(pageLimit, currentPage, bandTotal, basePath);
		  Object.assign(obj, page)
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
