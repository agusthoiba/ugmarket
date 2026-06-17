var router = express.Router();

const URI = require("urijs");
const { Op } = require("sequelize");

var Band = require("../../../models/band");

const moment = require("moment");
const pagination = require("../../../helpers/pagination");
const { SIZES } = require("../../../constant");
const { collect } = require("underscore");

const SORT_MAP = {
  newest: [["prod_id", "DESC"]],
  oldest: [["prod_id", "ASC"]],
  price_asc: [["prod_price", "ASC"]],
  price_desc: [["prod_price", "DESC"]],
  name_asc: [["prod_name", "ASC"]],
  name_desc: [["prod_name", "DESC"]],
};

router.get("/", async (req, res, next) => {
  const userId = parseInt(req.session.user.id);

  const search = (req.query.search || "").trim();
  const categoryFilter =
    req.query.category && !isNaN(parseInt(req.query.category))
      ? parseInt(req.query.category)
      : null;
  const conditionFilter = ["b", "s"].includes(req.query.condition)
    ? req.query.condition
    : "";
  const statusFilter = ["publish", "draft"].includes(req.query.status)
    ? req.query.status
    : "";
  const sortFilter = SORT_MAP[req.query.sort] ? req.query.sort : "newest";

  const query = { prod_user_id: userId, prod_is_deleted: 0 };
  if (search)
    query[Op.or] = [
      { prod_name: { [Op.like]: `%${search}%` } },
      { "$band.band_name$": { [Op.like]: `%${search}%` } },
    ];
  if (categoryFilter) query.prod_cat_id = categoryFilter;
  if (conditionFilter) query.prod_condition = conditionFilter;
  if (statusFilter === "publish") query.prod_is_visible = 1;
  if (statusFilter === "draft") query.prod_is_visible = 0;

  const pageLimit = 20;
  const option = {
    limit: pageLimit,
    page:
      req.query.page &&
      !isNaN(parseInt(req.query.page)) &&
      parseInt(req.query.page) > 0
        ? parseInt(req.query.page)
        : 1,
    sort: SORT_MAP[sortFilter],
  };

  const prodCount = await res.locals.productModel.count(query);
  const doc = await res.locals.productModel.find(query, option);

  const filterParams = new URLSearchParams();
  if (search) filterParams.set("search", search);
  if (categoryFilter) filterParams.set("category", categoryFilter);
  if (conditionFilter) filterParams.set("condition", conditionFilter);
  if (statusFilter) filterParams.set("status", statusFilter);
  if (sortFilter !== "newest") filterParams.set("sort", sortFilter);
  const filterStr = filterParams.toString();
  const basePath = filterStr
    ? `/account/product?${filterStr}`
    : "/account/product";

  const obj = {
    error: null,
    data: {
      products: [],
      categoryGroups: buildCategoryGroups(
        await res.locals.categoryModel.find(),
      ),
      filters: {
        search,
        category: categoryFilter,
        condition: conditionFilter,
        status: statusFilter,
        sort: sortFilter,
      },
    },
    isShowMenu: true,
  };

  if (doc.length > 0) {
    obj.data.products = doc.map((val) => {
      val.is_visible = val.prod_is_visible == 1;
      const imgs = val.prod_images.split(",");
      val.thumbnail = req.app.locals.cloudinary.url(imgs[0], {
        width: 100,
        height: 100,
        crop: "thumb",
      });
      return val;
    });
  }

  const paginate = pagination(pageLimit, option.page, prodCount, basePath);
  Object.assign(obj, paginate);

  if (req.query.json == "1") return res.json(obj);
  return res.render("front/account/product_list", obj);
});

router.get("/edit/:id", async (req, res, next) => {
  var userId = req.session.user.id;
  const prodId = parseInt(req.params.id);

  var obj = {
    error: null,
    data: {
      item: {},
      categories: [],
      bands: [],
      collections: [],
      sizes: SIZES,
    },
    action: `/account/product/update/${prodId}`,
    js: ["account_product", "product_image_dropzone"],
    isShowMenu: true
  };

  try {
    const product = await res.locals.productModel.findOne({
      prod_id: prodId,
      prod_user_id: userId,
    });

    obj.data.item = {
      id: product.prod_id,
      name: product.prod_name,
      category: product.prod_cat_id,
      band: product.prod_band_id,
      collection_id: product.prod_col_id,
      images: [],
      thumbnails: [],
      price: product.prod_price,
      weight: product.prod_weight,
      desc: product.prod_desc,
      marketplace_tokopedia:
        product.prod_marketplace_tokopedia_path == null
          ? ""
          : `https://www.tokopedia.com${product.prod_marketplace_tokopedia_path}`,
      marketplace_shoope:
        product.prod_marketplace_shoope_path == null
          ? ""
          : `https://shopee.co.id${product.prod_marketplace_shoope_path}`,
      marketplace_shopee:
        product.prod_marketplace_shopee_path == null
          ? ""
          : `https://shopee.co.id${product.prod_marketplace_shopee_path}`,
      is_visible: product.prod_is_visible == 1,
      sizes: req.app.locals.strToArr(product.prod_sizes, ","),
      condition: product.prod_condition,
      stock: product.prod_stock,
      created_at: product.prod_created_at,
    };

    let mps = [];
    if (product.prod_marketplaces && product.prod_marketplaces.length > 0) {
      mps = product.prod_marketplaces;
      for (let i = 0; i < mps.length; i++) {
        obj.data.item.marketplaces[mps[i].name] = mps[i].url;
      }
    }

    if (product.prod_images && product.prod_images != null) {
      const thumbs = req.app.locals.strToArr(product.prod_images, ",");

      obj.data.item.images = thumbs;
      obj.data.item.thumbnails = thumbs.map((val) => {
        return req.app.locals.cloudinary.url(val, {
          width: 100,
          height: 100,
          crop: "thumb",
        });
      });
    }

    obj.data.categories = await res.locals.categoryModel.find();
    obj.data.bands = await res.locals.bandModel.findAll();
    obj.data.collections = await req.app.locals.collectionModel.find({
      col_is_visible: 1,
    });

    if (req.query.json == "1") {
      return res.json(obj);
    }

    return res.render("front/account/product_form", obj);
  } catch (err) {
    console.error(err);
    obj.error = "An Error occured while load your product";
    if (req.query.json == "1") {
      return res.json(obj);
    }
    return res.render("front/account/product_form", obj);
  }
});

router.post("/update/:id", async function (req, res, next) {
  const prodId = parseInt(req.params.id);

  const query = {
    prod_id: prodId,
  };

  var obj = { error: null, data: null };

  try {
    const findBand = await res.locals.bandModel.findOne({
      band_id: req.body.band,
    });
    const payload = await cleanPost(req.body, findBand, "update");

    await res.locals.productModel.update(query, payload);
    return res.redirect("/account/product");
  } catch (err) {
    console.error(err);
    obj.error = "An Error occured while update your product";
    return res.render("front/account/product_form", obj);
  }
});

router.get("/add", async (req, res, next) => {
  var obj = {
    error: null,
    data: {},
    action: "/account/product/create",
    js: ["account_product", "product_image_dropzone"],
    isShowMenu: true
  };

  obj.data = {
    categories: await res.locals.categoryModel.find(),
    bands: await res.locals.bandModel.findAll({ band_enabled: 1 }),
    collections: await req.app.locals.collectionModel.find({
      col_is_visible: 1,
    }),
    sizes: SIZES,
    item: itemData(),
  };

  if (req.query.json == "1") {
    return res.json(obj);
  }
  return res.render("front/account/product_form", obj);
});

router.post("/create", async (req, res) => {
  var obj = {
    error: null,
    data: null,
    action: "/account/product/create",
    js: ["account_product", "product_image_dropzone"],
  };

  req.body.user_id = req.session.user.id;

  console.log("body.band: ", req.body.band);
  try {
    const findBand = await res.locals.bandModel.findOne({
      band_id: req.body.band,
    });

    const payload = await cleanPost(req.body, findBand);

    await res.locals.productModel.create(payload);

    await res.locals.bandModel.update(
      { band_id: payload.prod_band_id },
      {
        band_total_product: findBand.band_total_product + 1,
      },
    );

    return res.redirect("/account/product");
  } catch (err) {
    console.error(err);
    obj.data = {
      categories: await res.locals.categoryModel.find(),
      bands: await res.locals.bandModel.findAll(),
      sizes: SIZES,
      item: itemData(),
    };
    obj.error = "An Error occured while create your product";
    return res.render("front/account/product_form", obj);
  }
});

module.exports = router;

function buildCategoryGroups(categories) {
  const parents = categories.filter((c) => c.cat_parent_id === 0);
  const children = categories.filter((c) => c.cat_parent_id !== 0);
  const parentIds = new Set(parents.map((p) => p.cat_id));

  const groups = parents.map((p) => ({
    parent: p,
    children: children.filter((c) => c.cat_parent_id === p.cat_id),
  }));

  // categories whose parent isn't in the list — treat as standalone
  const orphans = children.filter((c) => !parentIds.has(c.cat_parent_id));
  if (orphans.length) groups.push({ parent: null, children: orphans });

  return groups;
}

function itemData() {
  return {
    name: "",
    category: "",
    description: "",
    price: 0,
    size: "",
    sizes: [],
    weight: 0,
    stock: 1,
    images: [],
    thumbnails: [],
    band: "",
    collection_id: "",
    marketplaces: {
      tokopedia: "",
      bukalapak: "",
      shopee: "",
    },
  };
}

/*function validate(req) {
    req.assert('name').notEmpty().len(2, 150);
    req.assert('category').notEmpty();
    req.assert('price').notEmpty();

    var errVal = [];
    if (req.validationErrors()) {
        var error = req.validationErrors();
        for (var i in error) {
            errVal.push(error[i].param + ' ' + error[i].msg);
        }
    }

    return errVal;
}*/

async function cleanPost(body, findBand, tipe = "create") {
  const prodSlug = slug(
    `${findBand.band_slug}-${body.name.trim().toLowerCase()}`,
  );
  console.log("prodSlug", prodSlug);

  var payload = {
    prod_name: body.name.trim(),
    prod_slug: prodSlug,
    prod_cat_id: body.category,
    prod_desc: body.description.trim(),
    prod_price: parseInt(body.price),
    prod_weight: parseInt(body.weight),
    prod_condition: body.condition,
    prod_stock: parseInt(body.stock),
    prod_band_id: body.band,
    prod_col_id: body.collection_id ? parseInt(body.collection_id) : 0,

    prod_is_visible: body.is_visible == "publish" ? 1 : 0,
    prod_sizes: body.sizes ? body.sizes.join() : "",
  };

  if (tipe == "create") {
    payload = Object.assign(payload, {
      prod_user_id: parseInt(body.user_id),
      prod_created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
  }

  if (body.marketplace_tokopedia) {
    const uriTokped = new URI(body.marketplace_tokopedia.trim());
    payload.prod_marketplace_tokopedia_path = uriTokped.path();
  }

  if (body.marketplace_shoope) {
    const uriShoope = new URI(body.marketplace_shoope.trim());
    payload.prod_marketplace_shoope_path = uriShoope.path();
  }

  if (body.marketplace_shopee) {
    const uriShopee = new URI(body.marketplace_shopee.trim());
    if (!["shopee.co.id"].includes(uriShopee.hostname())) {
      throw new Error("Invalid shopee URL");
    }
    payload.prod_marketplace_shopee_path = uriShopee.path();
  }

  if (body.prod_images_path) {
    payload.prod_images = body.prod_images_path;
    return payload;
  }

  return payload;
}

function getCategory(categoryModel) {
  return new Promise((resolve, reject) => {
    categoryModel.find({}, {}).then(
      (doc) => {
        return resolve(doc);
      },
      (err) => {
        return reject(err);
      },
    );
  });
}

function getBand() {
  let query = {};
  let option = {
    order: [["band_name", "asc"]],
  };

  return new Promise((resolve, reject) => {
    Band.find(query, option).then(
      (doc) => {
        return resolve(doc);
      },
      (err) => {
        return reject(err);
      },
    );
  });
}

async function getSyncData(catModel, bandModel) {
  let result = {
    categories: await getCategory(catModel),
    bands: await getBand(bandModel),
  };
  return result;
}
