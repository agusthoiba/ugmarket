
const router = express.Router()
const URI = require("urijs");
const { Op } = require("sequelize");
const crypto = require("crypto");


const { PRODUCT_SORT } = require('../../constant');
const cloudinaryTransformation = require('../../helpers/cloudinaryTransformation');
const { isArray, drop } = require("underscore");
const territoryIndonesia = require('territory-indonesia');

router.get('/', async (req, res, next) => {
  let pageLimit = 20;

  let obj = {
    error: null,
    js: ['product_list_new'],
    data: {
      breadcrumb: [
        {link: '#', text: 'products'}
      ],
      pageTitle: 'Merchandise Product',
      pageBanner: '',
      categories: req.app.locals.categories,
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
      },
      sort: PRODUCT_SORT,
      sizes: req.app.locals.sizes
    }
  }

  const maxLinkPagination = 5

  if (req.query.band) {
    obj.data.pageTitle = `${(req.query.band).trim().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - Official Merchandise`
    obj.data.pageBanner = req.app.locals.cloudinary.url(`bands/${req.query.band}-banner.jpg`)
  }

  let query = {
    prod_is_visible: 1
  }


  await _filtering(req, obj, query)


  var options = { 

    sort: [['prod_id', 'DESC']],
    page: obj.data.pagination.page,
    limit: obj.data.pagination.limit
  }

  if (req.query.sort) {
    options.sort = _sorting(req.query.sort);
  }


  try {
    const [prodTotal, sellerUser, sellerBySlug, bandData, collectionData, allCities] = await Promise.all([
      res.locals.productModel.count(query),
      req.query.seller
        ? (async () => {
            // First try to find seller by slug, then get user
            const sellerRec = await req.app.locals.sellerModel.findOne({ sel_slug: req.query.seller.trim() });
            if (sellerRec) {
              return res.locals.userModel.findOne({ user_id: sellerRec.sel_user_id });
            }
            // Fall back to username lookup
            return res.locals.userModel.findOne({ user_username: req.query.seller.trim() });
          })()
        : Promise.resolve(null),
      req.query.seller_slug
        ? req.app.locals.sellerModel.findOne({ sel_slug: req.query.seller_slug.trim() })
        : Promise.resolve(null),
      req.query.band
        ? res.locals.bandModel.findOne({ band_slug: req.query.band.trim() })
        : Promise.resolve(null),
      req.query.collection
        ? req.app.locals.collectionModel.findOne({ col_slug: req.query.collection.trim() })
        : Promise.resolve(null),
      territoryIndonesia.getAllRegencies()
    ]);



    // Build city lookup map
    const cityMap = {};
    allCities.forEach(c => { cityMap[parseInt(c.id)] = c.name; });


    // Handle seller by username (legacy) or by seller slug
    let activeSeller = null;
    if (sellerUser) {
      // Look up seller record by user ID; prefer seller fields, fallback to user fields
      let sellerRecord = null;
      try {
        sellerRecord = await req.app.locals.sellerModel.findOne({ sel_user_id: sellerUser.user_id });
      } catch (e) {
        // ignore seller lookup errors
      }

      const name = (sellerRecord && sellerRecord.sel_name) || sellerUser.user_name;
      const username = sellerUser.user_username;
      const avatar = (sellerRecord && sellerRecord.sel_avatar) || sellerUser.user_avatar;
      const slug = (sellerRecord && sellerRecord.sel_slug) || '';
      const sellerCityId = (sellerRecord && sellerRecord.sel_address_city_id) || sellerUser.user_address_city_id;
      let rawCity = sellerCityId && cityMap[sellerCityId] ? cityMap[sellerCityId] : '';
      const city = rawCity.replace(/^(Kabupaten|Kota)\s+/i, '');
      activeSeller = {
        name: name,
        username: username,
        slug: slug,
        avatar: avatar
          ? req.app.locals.cloudinary.url(avatar, { width: 100, height: 100, crop: 'thumb' })
          : null,
        city: city,
        total: prodTotal
      }
      obj.data.seller = activeSeller;
    } else if (sellerBySlug) {
      // Seller found by slug - look up user for username
      let userRecord = null;
      try {
        userRecord = await res.locals.userModel.findOne({ user_id: sellerBySlug.sel_user_id });
      } catch (e) {
        // ignore user lookup errors
      }

      const name = sellerBySlug.sel_name || (userRecord && userRecord.user_name) || '';
      const username = (userRecord && userRecord.user_username) || '';
      const avatar = sellerBySlug.sel_avatar || (userRecord && userRecord.user_avatar) || '';
      const slug = sellerBySlug.sel_slug || '';
      const sellerCityId = sellerBySlug.sel_address_city_id || (userRecord && userRecord.user_address_city_id) || 0;
      let rawCity = sellerCityId && cityMap[sellerCityId] ? cityMap[sellerCityId] : '';
      const city = rawCity.replace(/^(Kabupaten|Kota)\s+/i, '');
      activeSeller = {
        name: name,
        username: username,
        slug: slug,
        avatar: avatar
          ? req.app.locals.cloudinary.url(avatar, { width: 100, height: 100, crop: 'thumb' })
          : null,
        city: city,
        total: prodTotal
      }

      obj.data.seller = activeSeller;
    }


    if (bandData) {
      const { getCountryFlag } = require('../../helpers/countryFlag');
      obj.data.band = {
        name: bandData.band_name,
        slug: bandData.band_slug,
        image: bandData.band_image
          ? req.app.locals.cloudinary.url(bandData.band_image, { width: 200, height: 200, crop: 'thumb' })
          : null,
        genre: bandData.band_genre || '',
        country: bandData.band_country || '',
        countryFlag: getCountryFlag(bandData.band_country),
        total: prodTotal
      }
    }

    if (collectionData) {
      obj.data.collection = {
        name: collectionData.col_name,
        slug: collectionData.col_slug,
        bannerDesktop: collectionData.col_banner_desktop
          ? req.app.locals.cloudinary.url(collectionData.col_banner_desktop)
          : null,
        total: prodTotal
      }
    }

    obj.data.pagination.total = prodTotal;

    obj.data.pagination = _pagination(obj.data.pagination, req, maxLinkPagination);


    if (prodTotal > 0) {
      const doc = await res.locals.productModel.find(query, options);

      if (req.query.collection) {
        obj.data.pageTitle = `${doc[0]["collection.col_name"]} - Collection`;
      }

      // Batch fetch seller records for all products to get city from sellers table
      const sellerCityMap = {};
      if (doc.length > 0) {
        const userIds = [...new Set(doc.map(v => v.prod_user_id))];
        const sellerRecords = await req.app.locals.sellerModel.findAll({
          sel_user_id: { [Op.in]: userIds }
        });
        sellerRecords.forEach(s => {
          sellerCityMap[s.sel_user_id] = s.sel_address_city_id;
        });
      }

      obj.data.products = doc.map(val => {
        let thumbnail = '/image/no-image-180x180.png'
        if (val.prod_images != null) {
          let thumbArr = val.prod_images.split(',');
          thumbnail = req.app.locals.cloudinary.url(thumbArr[0], {
            width: 220, height: 220, crop: 'thumb',
            ...cloudinaryTransformation.watermark,
          });
        }

        const datum = Object.assign({}, val, { thumbnail: thumbnail })

        datum.prod_price = req.app.locals.currency(datum.prod_price).format('$0,0')

        // Add seller city name from sellers table (sel_address_city_id)
        const sellerCityId = sellerCityMap[val.prod_user_id];
        const cityId = sellerCityId || datum['user.user_address_city_id'];
        let rawCity = cityId && cityMap[cityId] ? cityMap[cityId] : '';
        datum.seller_city = rawCity.replace(/^(Kabupaten|Kota)\s+/i, '');

        return datum
      })

    }

    if (req.query.json == '1') {
      return res.json(obj);
    }

    //return res.render('front/product_list', obj)
    return res.render('front/product_list_new', obj)
  } catch (err) {
    console.error(err)
    obj.error = 'An Error occured while load your product'

    if (req.query.json == '1') {
      return res.json(obj);
    }

    //return res.render('front/product_list', obj)
    return res.render('front/product_list_new', obj)
  }
})

router.get('/:id/:slug', async (req, res) => {
  // Set X-Request-Id cookie with UUID v4
  res.cookie('X-Request-Id', crypto.randomUUID(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  const prodId = parseInt(req.params.id); // prodId
  const product = await res.locals.productModel.findOne({prod_id: prodId})

  const imageArr = req.app.locals.strToArr(product.prod_images, ',');

  let images = [];

  if (imageArr.length > 0) {
      for (let img of imageArr) {
        //obj.data.product.thumbnails.push(req.app.locals.cloudinary.url(img, {width: 100, height: 100, crop: 'thumb'}));
        images.push(req.app.locals.cloudinary.url(img, {
          width: 475,
          ...cloudinaryTransformation.watermark,
        }))
      }
  }


  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  const isLoggedIn = !!(req.session && req.session.user);

  const prodMarketPlace = {
    tokopedia: product.prod_marketplace_tokopedia_path,
    shopee: product.prod_marketplace_shoope_path
  }

  // Resolve seller city name
  const allCities = await territoryIndonesia.getAllRegencies();
  const cityMap = {};
  allCities.forEach(c => { cityMap[parseInt(c.id)] = c.name; });

  // Look up seller record from sellers table; prefer seller fields, fallback to user fields
  let sellerRecord = null;
  try {
    sellerRecord = await req.app.locals.sellerModel.findOne({ sel_user_id: product.prod_user_id });
  } catch (e) {
    // ignore seller lookup errors
  }

  const sellerName = (sellerRecord && sellerRecord.sel_name) || product['user.user_name'];
  const sellerUsername = product['user.user_username'] || null;
  const sellerSlug = (sellerRecord && sellerRecord.sel_slug) || '';
  const sellerAvatar = (sellerRecord && sellerRecord.sel_avatar) || product['user.user_avatar'];
  const sellerPhone = (sellerRecord && sellerRecord.sel_phone) || product['user.user_hp'];
  const sellerCityId = (sellerRecord && sellerRecord.sel_address_city_id) || product['user.user_address_city_id'];
  let rawCity = sellerCityId && cityMap[sellerCityId] ? cityMap[sellerCityId] : '';
  const sellerCity = rawCity.replace(/^(Kabupaten|Kota)\s+/i, '');

  // Count total published products for this seller
  const sellerTotalProduct = await res.locals.productModel.count({
    prod_user_id: product.prod_user_id,
    prod_is_visible: 1,
    prod_is_deleted: 0
  });

  // Map your existing fields into the template shape
  const data = {
    isLoggedIn,
    data: {
      breadcrumb: [
        { text: product['category.cat_name'], link: `/products?kategori=${product['category.cat_slug']}` },
        { text: product.prod_name, link: '' }
      ],
      waHref: isLoggedIn
        ? `https://wa.me/${sellerPhone}?text=Halo, saya tertarik dengan ${product['band.band_name']} - ${product.prod_name} (Rp ${(product.prod_price).toLocaleString('id-ID')}) ${currentUrl}`
        : null,
      pageTitle: `${product['category.cat_name']} ${product['band.band_name']} - ${product.prod_name}`,
      pageDescription: product.prod_desc,
      pageKeywords: `${product['band.band_name']}, ${product.prod_name}, merchandise, music`
    },
    product: {
      id: product.prod_id,
      sellerUserId: product.prod_user_id,
      title: product.prod_name,
      band: product['band.band_name'],
      bandSlug: product['band.band_slug'],
      images: images,
      price: product.prod_price,
      description: product.prod_desc,
      inStock: product.prod_stock > 0,
      stock: product.prod_stock,
      condition: product.prod_condition,
      shippingNote: '',
      sizes: product.prod_sizes
    },
    sizes: [
      { value:'xs', label:'XS' },
      { value:'s',  label:'S'  },
      { value:'m',  label:'M'  },
      { value:'l',  label:'L'  },
      { value:'xl', label:'XL' },
      { value:'xxl', label:'XXL' },
      { value:'3xl', label:'3XL' },
      { value:'4xl', label:'4XL' },
    ],
    seller: {
      name: sellerName,
      username: sellerUsername,
      slug: sellerSlug || slug((sellerName).toLowerCase(), '-'),
      avatar: sellerAvatar
        ? req.app.locals.cloudinary.url(sellerAvatar, {width: 75})
        : null,
      hp: isLoggedIn ? sellerPhone : null,
      city: sellerCity,
      totalProduct: sellerTotalProduct
    },

    marketplaces: [
      { name:'Tokopedia', url: prodMarketPlace.tokopedia ? 'https://tokopedia.com/' +  prodMarketPlace.tokopedia : null, icon:'/marketplace/tokopedia.png' },
      { name:'Shopee', url: prodMarketPlace.shopee ? 'https://shopee.com/' + prodMarketPlace.shopee : null, icon:'/marketplace/shopee.png' }
    ]
    // related: await getRelatedProducts(product.id)
  }

  if (req.query.json == '1') {
    return res.json(data)
  }

  res.render('front/product_detail_new', data);
});

/*router.get('/:id/:slug', async (req, res, next) => {
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
      sizes: req.app.locals.sizes
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
        sizes: req.app.locals.strToArr(product.prod_sizes, ',')
      })

      obj.data.user = {
        name: product['user.user_name'],
        avatar: product['user.user_avatar'] != null ? req.app.locals.cloudinary.url(product['user.user_avatar'], {width: 100, height: 100, crop: 'thumb'}) : '/image/logo-ugmarket.jpg'
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
})*/

module.exports = router

async function _filtering(req, obj, query) {

  if (req.query.kategori) {
    let catSlug = '';
    if (isArray(req.query.kategori)) {
      catSlug = (req.query.kategori)[0]
    } else {
      catSlug = (req.query.kategori).trim()
    }
    const findCat = req.app.locals.categoryList.find(cat => {
      return cat.cat_slug == catSlug
    });

    obj.data.breadcrumb = [{
      link: '#', text: findCat.cat_name
    }]

    obj.data.pageTitle = findCat.cat_name;

    if (findCat != null) {
      const catChild = req.app.locals.categoryList.filter(cat => {
        return cat.cat_parent_id == findCat.cat_id
      });

      let catIds = [findCat.cat_id];

      if (catChild != null) {
        catIds = catIds.concat(_.pluck(catChild, 'cat_id'));
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
    obj.data.pageTitle = 'Local Band'
  }

  var url = new URI(req.originalUrl);
  url.removeQuery("page");

  obj.data.uri.query = url.search(true)

  if (obj.data.uri.query.condition != undefined) {
    obj.data.uri.query.condition = (obj.data.uri.query.condition).split(',')
  }

  if (obj.data.uri.query.categories != undefined) {
    const catSlugParams = ((obj.data.uri.query.categories).trim()).split(',');

    let catIds = [];
    for(cat of req.app.locals.categoryList) {
      if (catSlugParams.includes(cat.cat_slug)) {
        catIds.push(cat.cat_id);
      }
    }
    query.prod_cat_id = catIds;
  }
  
  if (req.query.page) {
    obj.data.pagination.baseUrl = url.toString();
  }

  if (req.query.search && req.query.search.length > 2) {
    const regexStr = /[^a-zA-Z0-9 ]/g;
    const searchInput = `%${((decodeURIComponent(req.query.search)).trim()).replace(regexStr, '')}%`;
    console.log('searchInput: ', searchInput);

    query[Op.or] = [
      {
        '$band.band_name$': {
          [Op.like]: searchInput
        },
      },
      {
        prod_name: {
          [Op.like]: searchInput
        }
      }
    ];

    obj.data.breadcrumb.push({ path: '', name: req.query.search});
  }

  if (req.query.condition) {
    const conditionTr = (req.query.condition).trim();
    const conditions = conditionTr.split('')
    if (conditions.indexOf('b') > -1 || conditions.indexOf('s') > -1) {
      query.prod_condition = {
        [Op.or]: conditionTr.split(',')
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

  const priceMin = req.query.price_min ? parseInt(req.query.price_min) : 0;
  const priceMax = req.query.price_max ? parseInt(req.query.price_max) : 0;
  if (priceMin > 0 || priceMax > 0) {
    query.prod_price = {};
    if (priceMin > 0) query.prod_price[Op.gte] = priceMin;
    if (priceMax > 0) query.prod_price[Op.lte] = priceMax;
  }

  if (req.query.band) {
    query['$band.band_slug$'] = req.query.band.trim();
  }

  if (req.query.country) {
    query['$band.band_country$'] = req.query.country.trim();
  }

  if (req.query.seller) {
    // First try to find seller by slug
    const sellerBySlug = await req.app.locals.sellerModel.findOne({ sel_slug: req.query.seller.trim() });
    if (sellerBySlug) {
      // Found by slug - filter by user ID
      query.prod_user_id = sellerBySlug.sel_user_id;
      obj.data.pageTitle = `Produk dari ${sellerBySlug.sel_name || req.query.seller.trim()}`;
    } else {
      // Not found by slug - fall back to username lookup
      query['$user.user_username$'] = req.query.seller.trim();
      obj.data.pageTitle = `Produk dari ${req.query.seller.trim()}`;
    }
  }



  if (req.query.collection) { 

    query['$collection.col_slug$'] = req.query.collection.trim();
  }
}

function _sorting(sortParamText) {
  const sortParam = (sortParamText).trim();
  const prodSortSlugs = _.pluck(PRODUCT_SORT, 'slug');

  let sortResult = [];

  if (prodSortSlugs.includes(sortParam)) {
    switch (sortParam) {
      case PRODUCT_SORT.PRICE_HIGH.slug:
        sortResult = [['prod_price', 'DESC']];
        break;
      case PRODUCT_SORT.PRICE_LOW.slug:
        sortResult = [['prod_price', 'ASC']];
        break;
      case PRODUCT_SORT.NEW_PRODUCT.slug:
        sortResult = [['prod_id', 'DESC']];
        break;
      case PRODUCT_SORT.OLD_PRODUCT.slug:
        sortResult = [['prod_id', 'ASC']];
        break;
      default:
        sortResult = [['prod_total_sold', 'DESC']];
    }
  }


  return sortResult;
}

function _pagination(objPagination, req, maxLinkPagination = 5) {
  const total = objPagination.total;

  if (total <= objPagination.limit) {
    objPagination.total_page =  1;
    objPagination.list.push({
      link: `#`,
      no: 1,
      active: true
    });
  } else {
    objPagination.total_page =  Math.ceil(objPagination.total / objPagination.limit);
    
    const totalPage = objPagination.total_page;
    
    let urlParams; 
    
    if (req.query) {
      urlParams = new URLSearchParams(req.query);
    } else {
      urlParams = new URLSearchParams();
    }

    let countLinkPage = maxLinkPagination;
    if (totalPage < maxLinkPagination) {
      countLinkPage = totalPage;
    }

    const pageList  = [];
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
