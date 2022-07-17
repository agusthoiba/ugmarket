const config = require('../config');
const { Band, Category, Product, User } = require('../models')

const modelMiddleware = (req, res, next) => {
    req.app.locals.config = config;

    res.locals.bandModel = new Band({
        db: req.app.locals.db
    });
    res.locals.categoryModel = new Category({
        db: req.app.locals.db
    });

    res.locals.userModel = new User({
        db: req.app.locals.db
    });

    res.locals.productModel = new Product({
        db: req.app.locals.db,
        category: res.locals.categoryModel,
        band: res.locals.bandModel,
        user: res.locals.userModel
    });

    // req.locals.merchantModel = new Merchant({
    //    db: req.app.locals.db
    // });

    return next();
}

module.exports = modelMiddleware;
