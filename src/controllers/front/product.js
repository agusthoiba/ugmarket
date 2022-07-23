

const router = express.Router()
const URI = require("urijs");
const { Op } = require("sequelize");

router.get('/', async (req, res, next) => {
  let pageLimit = 20;

  let obj = {
    error: null,
    js: ['product_list'],
    data: {
      breadcrumb: [
        {link: '#', text: 'products'}
      ],
      products: [],
      pagination: {
        limit: pageLimit,
        page: req.query.page && !isNaN(parseInt(req.query.page)) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1,
        total_page: 1,
        total: 0,
        list: []
      },
      uri: {
        path: '',
        params: '',
        query: {}
      }
    }
    // catSlug: req.params.catSlug
  }

  const maxLinkPagination = 5 // maximal number of link pagination

  let query = {
    prod_is_visible: 1
  }

  _filtering(req, obj, query)

  var options = { 
    sort: [['prod_id', 'DESC']],
    page: obj.data.pagination.page,
    limit: obj.data.pagination.limit
  }

  try {
    const prodTotal = await res.locals.productModel.count(query);

    obj.data.pagination.total = prodTotal;
    obj.data.pagination = _pagination(obj.data.pagination);

    if (prodTotal > 0) {
      const doc = await res.locals.productModel.find(query, options);

      console.log('doc --', doc)

      obj.data.products = doc.map(val => {
        
        let thumbnail = '/image/no-image-180x180.png'
        if (val.prod_images != null) {
          let thumbArr = val.prod_images.split(',');
          thumbnail = req.app.locals.cloudinary.url(thumbArr[0],{width: 220, height: 220, crop: 'thumb'});
        }

        const datum = Object.assign({}, val, { thumbnail: thumbnail })

        datum.prod_price = req.app.locals.currency(datum.prod_price).format('$0,0')

        return datum
      })
    }

    if (req.query.json == '1') {
      return res.json(obj);
    }

    return res.render('front/product_list', obj)
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while load your product'

    if (req.query.json == '1') {
      return res.json(obj);
    }

    return res.render('front/product_list', obj)
  }
})

router.get('/:id/:slug', async (req, res, next) => {
  const prodId = parseInt(req.params.id)

  let obj = {
    error: null,
    data: {
      breadcrumb: [
        {link: '', text: ''},
        {link: '', text: ''}
      ],
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

      const images = req.app.locals.strToArr(product.prod_images, ',');

      if (images.length > 0) {
        for (let img of images) {
          obj.data.product.thumbnails.push(req.app.locals.cloudinary.url(img, {width: 100, height: 100, crop: 'thumb'}));
          obj.data.product.images.push(req.app.locals.cloudinary.url(img, {width: 475}))
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

function _filtering(req, obj, query) {
  if (req.query.kategori) {
    const catSlug = (req.query.kategori).trim()
    const findCat = req.app.locals.categoryList.find(cat => {
      return cat.cat_slug == catSlug
    });

    
    obj.data.breadcrumb = [{
      link: '#', text: findCat.cat_name
    }]

    if (findCat != null) {
      const catChild = req.app.locals.categoryList.find(cat => {
        return cat.cat_parent_id == findCat.cat_id
      });

      let catIds = [findCat.cat_id];

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

  if (req.query['lokal-band'] && ['1', '0'].includes(req.query['lokal-band'])) {
    query['$band.band_is_local$'] = req.query['lokal-band'] == '1'
  }

  var url = new URI(req.originalUrl);
  url.removeQuery("page");

  obj.data.uri.query = url.search(true)

  if (obj.data.uri.query.condition != undefined) {
    obj.data.uri.query.condition = (obj.data.uri.query.condition).split(',')
  }

  if (obj.data.uri.query.categories != undefined) {
    obj.data.uri.query.categories = ((obj.data.uri.query.categories).split(',')).map(catId => {
      return parseInt(catId)
    })
  }
  
  if (req.query.page) {
    obj.data.pagination.baseUrl = url.toString();
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
    obj.data.breadcrumb.push({ path: '', name: req.query.search});
  }

  if (req.query.condition) {
    const conditions = req.query.condition.split('')
    if (conditions.indexOf('b') > -1 || conditions.indexOf('s') > -1) {
      query.prod_condition = {
        [Op.or]: req.query.condition.split(',')
      }
    }
  }

  let catChilds;
  if (req.query.categories) {
    let filterCategories = [];
    const reqCategories = req.query.categories.split(',');
    const filterCatParent = req.app.locals.categoryList.filter(cat => {
      return cat.cat_parent_id === 0
    })
    const filterCatChild = req.app.locals.categoryList.filter(cat => {
      return cat.cat_parent_id > 0
    })


    for (let i = 0; i < reqCategories.length; i++) {
      if (!isNaN(parseInt(reqCategories[i]))) {
        if ((_.pluck(filterCatParent, 'cat_id')).includes(parseInt(reqCategories[i]))) {
          catChilds = req.app.locals.categoryList.filter(cat => {
            return cat.cat_parent_id === parseInt(reqCategories[i])
          })
          const catChildIds = _.pluck(catChilds, 'cat_id')
          filterCategories.push(catChildIds)
        }
        filterCategories.push(parseInt(reqCategories[i]));
      }
    }

    if (filterCategories.length > 0) {
      query.prod_cat_id = {
        [Op.or]: filterCategories
      }
    }
  }
}

function _pagination(objPagination, req) {
  const total = objPagination.total;

  if (total <= objPagination.limit) {
    objPagination.total_page =  1;
    objPagination.list.push({
      link: `#`,
      no: 1,
      active: true
    });
  } else {
    objPagination.total_page =  Math.floor(objPagination.total / objPagination.limit);
    
    const totalPage = objPagination.total_page;
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
        active: objPagination.page === i
      })
    }

    objPagination.list = pageList;
  }

  return objPagination;
}