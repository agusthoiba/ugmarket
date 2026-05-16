async function predefinedMiddleware(req, res, next) {
  try {
    // --- Categories (nested) ---
    const categoryModel = res.locals.categoryModel;
    const findCats = await categoryModel.find();

    req.app.locals.categoryList = findCats;

    const categoriesNested = findCats.filter((cat) => cat.cat_parent_id === 0);

    for (let i = 0; i < categoriesNested.length; i++) {
      const catChilds = findCats.filter(
        (cat) => cat.cat_parent_id === categoriesNested[i].cat_id,
      );

      categoriesNested[i] = Object.assign(categoriesNested[i], {
        childs: catChilds.sort((a, b) => {
          const aIsOther = a.cat_name.toLowerCase() === "others";
          const bIsOther = b.cat_name.toLowerCase() === "others";
          if (aIsOther) return 1;
          if (bIsOther) return -1;
          return a.cat_name.localeCompare(b.cat_name);
        }),
      });
    }

    req.app.locals.categories = categoriesNested;

    // --- Collections ---
    const collectionModel = req.app.locals.collectionModel;
    let collections = await collectionModel.find({});
    collections.sort((a, b) => (a.col_sort || 0) - (b.col_sort || 0));
    req.app.locals.collections = collections;

    return next();
  } catch (err) {
    console.error("[PREDEFINED_MIDDLEWARE]", err);
    return next(err);
  }
}

module.exports = predefinedMiddleware;
