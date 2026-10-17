const config = require("../config");
const {
  Band,
  Genre,
  Category,
  Product,
  User,
  Contact,
  UserAdmin,
  Collections,
  Seller,
  Favorite,
  Cart,
} = require("../models");

const Upload = require("../helpers/uploadCloudinary");

/**
 * Create the model wrappers for a database connection.
 * @param {Object} db - sequelize instance
 * @returns {Object} - model wrappers
 */
const createModels = (db) => {
  const genreModel = new Genre({ db: db });
  const bandModel = new Band({ db: db });
  const categoryModel = new Category({ db: db });
  const userModel = new User({ db: db });
  const collectionModel = new Collections({ db: db });

  const productModel = new Product({
    db: db,
    category: categoryModel,
    band: bandModel,
    user: userModel,
    collections: collectionModel,
  });

  const contactModel = new Contact({ db: db });
  const userAdminModel = new UserAdmin({ db: db });

  const sellerModel = new Seller({
    db: db,
    user: userModel,
  });

  const favoriteModel = new Favorite({
    db: db,
    user: userModel,
    product: productModel,
    band: bandModel,
  });

  const cartModel = new Cart({
    db: db,
    user: userModel,
    product: productModel,
    band: bandModel,
  });

  return {
    genreModel,
    bandModel,
    categoryModel,
    userModel,
    collectionModel,
    productModel,
    contactModel,
    userAdminModel,
    sellerModel,
    favoriteModel,
    cartModel,
    uploadCloudinary: new Upload(),
  };
};

/**
 * The models are shared by every request. Defining them again on each request
 * made sequelize re-run its schema sync (information_schema + show index
 * queries) on every single page hit, which slowed down the pages a lot.
 */
let models = null;

const modelMiddleware = async (req, res, next) => {
  try {
    req.app.locals.config = config;

    if (!models) {
      const db = req.app.locals.db || (await req.app.locals.dbReady);

      models = createModels(db);
    }

    res.locals.genreModel = models.genreModel;
    res.locals.bandModel = models.bandModel;
    res.locals.categoryModel = models.categoryModel;
    res.locals.userModel = models.userModel;
    req.app.locals.collectionModel = models.collectionModel;
    res.locals.productModel = models.productModel;
    res.locals.contactModel = models.contactModel;
    res.locals.userAdminModel = models.userAdminModel;
    req.app.locals.sellerModel = models.sellerModel;
    req.app.locals.favoriteModel = models.favoriteModel;
    req.app.locals.cartModel = models.cartModel;
    res.locals.uploadCloudinary = models.uploadCloudinary;

    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = modelMiddleware;
