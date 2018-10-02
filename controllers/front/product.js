

const router = express.Router()

const Product = require('../../models/product')
// var Category = require(config.base_dir + '/models/category');
// var Band = require(config.base_dir + '/models/band');
// var User = require(config.base_dir + '/models/user');

router.get('/', async (req, res, next) => {
  let obj = {
    error: null,
    data: {
      products: [],
      pagination: {
        limit: 20,
        page: 1,
        total_page: 10
      }
    }
  }

  var query = {
    prod_is_visible: 1
  }

  var options = { sort: { created_at: 'desc' } }

  let doc
  try {
    doc = await Product.find(query, options)

    if (doc.length > 0) {
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
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while load your product'
  }

  // return res.json(obj)
  return res.render('front/product_list', obj)
})

router.get('/:id/:slug', async (req, res, next) => {
  // var userId = req.session.user.id
  const prodId = parseInt(req.params.id)

  let obj = {
    error: null,
    data: {
      product: null
    }
  }

  try {
    const product = await Product.findOneById(prodId)

    if (product) {
      obj.data.product = Object.assign({}, product, {
        images: [],
        thumbnails: [],
        sizes: req.app.locals.strToArr(product.prod_sizes_available, ',')
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
      /* let thumbnail = `${pathThumb}/${product.prod_thumbnails}`

      if (product.prod_thumbnails.includes(',')) {
        let thumbArr = product.prod_thumbnails.split(',')
        thumbnail = `${pathThumb}/${thumbArr[0]}`
      }

      const datum = Object.assign({}, val, { thumbnail: thumbnail }) */
    }
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while load your product'
  }

  // return res.json(obj)

  return res.render('front/product_detail', obj)
})

module.exports = router
