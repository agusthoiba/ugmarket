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

const modelMiddleware = (req, res, next) => {
  req.app.locals.config = config;

  res.locals.genreModel = new Genre({
    db: req.app.locals.db,
  });

  res.locals.bandModel = new Band({
    db: req.app.locals.db,
  });

  res.locals.categoryModel = new Category({
    db: req.app.locals.db,
  });

  res.locals.userModel = new User({
    db: req.app.locals.db,
  });

  req.app.locals.collectionModel = new Collections({
    db: req.app.locals.db,
  });

  res.locals.productModel = new Product({
    db: req.app.locals.db,
    category: res.locals.categoryModel,
    band: res.locals.bandModel,
    user: res.locals.userModel,
    collections: req.app.locals.collectionModel,
  });

  res.locals.contactModel = new Contact({
    db: req.app.locals.db,
  });

  res.locals.userAdminModel = new UserAdmin({
    db: req.app.locals.db,
  });

  req.app.locals.sellerModel = new Seller({
    db: req.app.locals.db,
    user: res.locals.userModel,
  });

  req.app.locals.favoriteModel = new Favorite({
    db: req.app.locals.db,
    user: res.locals.userModel,
    product: res.locals.productModel,
    band: res.locals.bandModel,
  });

  req.app.locals.cartModel = new Cart({
    db: req.app.locals.db,
    user: res.locals.userModel,
    product: res.locals.productModel,
    band: res.locals.bandModel,
  });

  res.locals.uploadCloudinary = new Upload();

  return next();
};

module.exports = modelMiddleware;
