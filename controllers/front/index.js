var router = express.Router();

router.get('/', async (req, res, next) => {
  var obj = { error: null, data: { products: [] } }
  var query = { prod_is_visible: 1 }
  var options = { sort: { prod_id: 'desc' }, limit: 20 }
  const doc = await res.locals.productModel.find(query, options)
  
  if (doc.length > 0) {
    obj.data.products = doc.map(val => {
      val.is_visible = val.prod_is_visible === 1
      const pathThumb = `${config.file_host}/product/thumbnail`
      val.thumbnail = `${pathThumb}/${val.prod_thumbnails}`
      if (val.prod_thumbnails.includes(',')) {
        let thumbArr = val.prod_thumbnails.split(',')
        val.thumbnail = `${pathThumb}/${thumbArr[0]}`
      }
      return val
    })
  }
  // return res.json(doc);
  return res.render('front/index', obj)
})

module.exports = router
