

const router = express.Router()
const { Op } = require("sequelize");

router.get('/', async (req, res, next) => {
  let obj = {
    error: null,
    data: {
      breadcrumb: [
        {link: '', text: req.query.kategori}
      ],
      products: [],
      pagination: {
        limit: 20,
        page: req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1,
        total_page: 1,
        total: 0,
        list: []
      }
    }
  }

  const maxLinkPagination = 5 // maximal number of link pagination

  let query = {
    prod_is_visible: 1
  }

  
  if (req.query.kategori) {
    const catSlug = (req.query.kategori).trim();
    const catMod = await res.locals.categoryModel.findOne({
      cat_slug: catSlug
    });
    if (catMod != null) {
      const catChild = await res.locals.categoryModel.find({
        cat_parent_id: catMod.cat_id
      });

      let catIds = [catMod.cat_id];
      if (catChild != null) {
        catIds.push(_.pluck(catChild, 'cat_id'));
      }

      query = Object.assign(query, { 
        prod_cat_id: {
          [Op.in]: catIds
        }
      });
    }
  }

  obj.data.pagination.total =  await res.locals.productModel.count(query);

  var options = { 
    sort: [['prod_id', 'DESC' ]],
    page: obj.data.pagination.page,
    limit: obj.data.pagination.limit
  }

  let doc;
  try {
    doc = await res.locals.productModel.find(query, options)

    if (obj.data.pagination.total <= obj.data.pagination.limit) {
      obj.data.pagination.total_page =  1;
      obj.data.pagination.list.push({
        link: `#`,
        no: 1,
        active: true
      });
    } else {
      obj.data.pagination.total_page =  Math.floor(obj.data.pagination.total / obj.data.pagination.limit);

      const total = obj.data.pagination.total;
      const totalPage = obj.data.pagination.total_page;
      const pageList  = [];
      
      const urlParams = new URLSearchParams(req.query);

      let countLinkPage = maxLinkPagination;
      if (totalPage < maxLinkPagination) {
        countLinkPage = totalPage;
      }

      for (let i = 1; i <= totalPage; i++) {
        urlParams.set('page', i);
        pageList.push({
          link: `/products?${urlParams}`,
          no: i,
          active: obj.data.pagination.page === i
        })
      }

      obj.data.pagination.list = pageList;
    }

    if (doc.length > 0) {
      obj.data.products = doc.map(val => {
        const pathThumb = `${config.file_host}/product/thumbnail`
        let thumbnail = `${pathThumb}/${val.prod_thumbnails}`

        if (val.prod_thumbnails && val.prod_thumbnails != null && val.prod_thumbnails.includes(',')) {
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

  if (req.query.json == '1') {
    return res.json(obj);
  }

  return res.render('front/product_list', obj)
})

router.get('/:id/:slug', async (req, res, next) => {
  // var userId = req.session.user.id
  const prodId = parseInt(req.params.id)

  let obj = {
    error: null,
    data: {
      breadcrumb: [
        {link: '', text: ''},
        {link: '', text: ''}
      ],
      product: null,
      user: null
    }
  }

  try {
    const product = await res.locals.productModel.findOne({prod_id: prodId})

    if (product) {
      obj.data.breadcrumb[0].link = `/products?kategori=${product['category.cat_slug']}`;
      obj.data.breadcrumb[0].text = product['category.cat_name'];

      obj.data.breadcrumb[1].text = product.prod_name;

      obj.data.product = Object.assign({}, product, {
        images: [],
        thumbnails: [],
        sizes: req.app.locals.strToArr(product.prod_sizes_available, ',')
      })

      obj.data.user = {
        name: product['user.user_name'],
        avatar: product['user.user_avatar']
      };

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

  if (req.query.json == '1') {
    return res.json(obj);
  }

  return res.render('front/product_detail', obj)
})

module.exports = router
