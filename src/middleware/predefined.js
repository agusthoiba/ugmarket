// Categories and collections are identical for every visitor, so they are kept
// in memory for a few minutes instead of being queried on each request.
const { buildCategoryTree } = require("../helpers/category");

const PREDEFINED_TTL = 5 * 60 * 1000;
let predefinedCache = null;

/**
 * Drop the cached categories/collections, used when an admin edits them.
 */
const invalidatePredefined = () => {
  predefinedCache = null;
};

function applyPredefined(req, cache) {
  req.app.locals.categoryList = cache.categoryList;
  req.app.locals.categories = cache.categories;
  req.app.locals.collections = cache.collections;
}

async function predefinedMiddleware(req, res, next) {
  try {
    if (predefinedCache && predefinedCache.expiresAt > Date.now()) {
      applyPredefined(req, predefinedCache);
      return next();
    }

    // --- Categories (nested, parents ordered by cat_sort) ---
    const categoryModel = res.locals.categoryModel;
    const findCats = await categoryModel.find();

    const categoriesNested = buildCategoryTree(findCats);

    // --- Collections ---
    const collectionModel = req.app.locals.collectionModel;
    let collections = await collectionModel.find({});
    collections.sort((a, b) => (a.col_sort || 0) - (b.col_sort || 0));

    predefinedCache = {
      categoryList: findCats,
      categories: categoriesNested,
      collections: collections,
      expiresAt: Date.now() + PREDEFINED_TTL,
    };

    applyPredefined(req, predefinedCache);

    return next();
  } catch (err) {
    console.error("[PREDEFINED_MIDDLEWARE]", err);
    return next(err);
  }
}

module.exports = predefinedMiddleware;
module.exports.invalidatePredefined = invalidatePredefined;
