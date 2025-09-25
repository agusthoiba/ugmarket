const config = require('../config');
const { Band, Genre, Category, Product, User, Contact, UserAdmin, Collections  } = require('../models')
const Upload = require('../helpers/uploadCloudinary');

const modelMiddleware = (req, res, next) => {
    req.app.locals.config = config;

    res.locals.genreModel = new Genre({
        db: req.app.locals.db
    });

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

    res.locals.contactModel = new Contact({
       db: req.app.locals.db
    });


    res.locals.userAdminModel = new UserAdmin({
       db: req.app.locals.db
    });

    res.locals.collectionModel = new Collections({
       db: req.app.locals.db
    });

    res.locals.uploadCloudinary = new Upload();

    return next();
}

module.exports = modelMiddleware;
