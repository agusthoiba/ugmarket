const router = express.Router();

router.get('/', async (req, res, next) => {
  var obj = { error: null, data: { products: [], bands: [], collections: [] } }
  var query = { prod_is_visible: 1, band_enabled: 1 };
  const sort = {prod_id: 'DESC'};
  const doc = await res.locals.productModel.findRaw(query, sort)
  
  if (doc.length > 0) {
    obj.data.products = doc.map(val => {
      val.is_visible = val.prod_is_visible === 1

      if (val.prod_images) {
        const images = val.prod_images.split(',');
        val.thumbnail = req.app.locals.cloudinary.url(images[0], {width: 200, height: 200, crop: 'thumb'});
      }
      return val
    })
  }

  if (req.query.json == '1') {
    return res.json(obj);
  }

  const optionsFindBands = { sort: [['band_total_sold', 'DESC']] , limit: 20 }
  const queryBand = {band_enabled: 1};
  const findBands = await res.locals.bandModel.find(queryBand, optionsFindBands);

  if (findBands.length > 0) {
    obj.data.bands = findBands.map(band => {
      band.band_logo = req.app.locals.cloudinary.url(`bands/${band.band_slug}-logo.png`, {})
      return band
    });
  }

  obj.data.collections = await res.locals.collectionModel.find({ col_is_visible: 1});

  obj.data.collections = obj.data.collections.map(col => {
    col.href = `/products?collection=${col.col_slug}`;
    if (col.col_thumbnail) {
      col.thumbnailUrl = req.app.locals.cloudinary.url(col.col_thumbnail, {width: 320, height: 320, crop: "thumb"});
    } else {
      col.thumbnailUrl = 'https://via.placeholder.com/320x320?text=No+Image';
    }
    return col;
  });

  if (req.query.json == '1') {
    return res.json(obj);
  }
  
  return res.render('front/index', obj)
})

module.exports = router
