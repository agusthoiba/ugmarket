

const router = express.Router()
const URI = require("urijs");
const { Op } = require("sequelize");

router.get('/:catSlug?', async (req, res, next) => {
  let limit = 20;
  let obj = {
    error: null,
    data: {
      products: [],
      pagination: {
        baseUrl: req.originalUrl,
        limit: limit,
        page: 1,
        totalPage: 1,
        total: 0
      },
      breadcumb: [
        { path: '/p', name: 'Semua Produk'},
      ]
    }
  }

  var url = new URI(req.originalUrl);
  url.removeQuery("page");
  
  if (req.query.page) {
    obj.data.pagination.baseUrl = url.toString();
  }

  var query = {
    prod_is_visible: 1
  }

  if (req.params.catSlug) {
    const findCat = req.app.locals.categoryList.find(cat => {
      return cat.cat_slug == req.params.catSlug
    });
    obj.data.breadcumb.push({ path: '', name: findCat.cat_name});
    query.prod_cat_id = findCat.cat_id;
  }

  if (req.query.search && req.query.search.length > 2) {
    query[Op.or] = [
      {
        '$band.band_name$': {
          [Op.like]: `%${req.query.search}%`
        },
      },
      {
        prod_name: {
          [Op.like]:`%${req.query.search}%`
        }
      }
    ];
    obj.data.breadcumb.push({ path: '', name: req.query.search});
  }

  var options = { 
    sort: { prod_created_at: 'DESC' },
    limit: limit,
    page: 0
  };

  let doc;
  const prodTotal = await res.locals.productModel.count(query)

  if (prodTotal > 0) {
    obj.data.pagination.total = prodTotal;
    obj.data.pagination.totalPage = prodTotal < limit ? 1 : Math.floor(prodTotal / limit);

    if (prodTotal > limit) {
      if (!isNaN(parseInt(req.query.page))) {
        obj.data.pagination.page = parseInt(req.query.page);
        options.page = obj.data.pagination.page;
      }
    }

    doc = await res.locals.productModel.find(query, options)
    obj.data.products = doc.map(val => {
      const pathThumb = `${config.file_host}/product/thumbnail`
      let thumbnail = `${pathThumb}/${val.prod_thumbnails}`

      if (val.prod_thumbnails.includes(',')) {
        let thumbArr = val.prod_thumbnails.split(',')
        thumbnail = `${pathThumb}/${thumbArr[0]}`
      }

      const datum = Object.assign({}, val, { thumbnail: thumbnail })

      datum.prod_price = req.app.locals.currency(datum.prod_price).format('$0,0')

      return datum
    })
  }

  // return res.json(obj)
  return res.render('front/product_list', obj)
})

router.get('/:catSlug/:id/:slug', async (req, res, next) => {
  // var userId = req.session.user.id
  const prodId = parseInt(req.params.id)

  let obj = {
    error: null,
    data: {
      product: null,
      user: null,
      breadcumb: [
        { path: '/p', name: 'Semua Produk' }
      ]
    }
  }

  try {
    const product = await res.locals.productModel.findOne({prod_id: prodId})

    if (product) {
      obj.data.product = Object.assign({}, product, {
        images: [],
        thumbnails: [],
        sizes: req.app.locals.strToArr(product.prod_sizes_available, ',')
      })

      obj.data.user = {
        name: product['user.user_name'],
        avatar: product['user.user_avatar']
      };

      obj.data.breadcumb.push({
        path: `/p/${product['category.cat_slug']}`,
        name: product['category.cat_name'],
      })

      obj.data.breadcumb.push({
        path: '',
        name: product.prod_name,
      })

      const pathThumb = `${config.file_host}/product/thumbnail`
      const pathLarge = `${config.file_host}/product/large`

      const imageThumbs = req.app.locals.strToArr(product.prod_thumbnails)
      const images = req.app.locals.strToArr(product.prod_images)

      if (imageThumbs.length > 0) {
        for (let i in imageThumbs) {
          obj.data.product.thumbnails.push(`${pathThumb}/${imageThumbs[i]}`)
        }
      }

      if (images.length > 0) {
        for (let j in images) {
          obj.data.product.images.push(`${pathLarge}/${images[j]}`)
        }
      }

      obj.data.product.prod_price = req.app.locals.currency(obj.data.product.prod_price).format('$0,0')
    }
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while load your product'
  }

  //return res.json(obj)

  return res.render('front/product_detail', obj)
})

module.exports = router
