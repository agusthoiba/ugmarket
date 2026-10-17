// Categories are stored flat (one row per category, `cat_parent_id` pointing to
// its parent) but are rendered as a two level menu. The ordering rules are used
// both by the initial page load and by the predefined middleware cache, so they
// live here instead of being duplicated.
const OTHERS_CATEGORY_NAME = "others";

/**
 * Order the parent (top level) categories by `cat_sort`, the column the admin
 * edits to pick the order of the category menu.
 *
 * @param {Object} a first category
 * @param {Object} b second category
 * @returns {number} sort value
 */
const sortParentByCatSort = (a, b) => (a.cat_sort || 0) - (b.cat_sort || 0);

/**
 * Order the children of a parent category alphabetically, keeping the "Others"
 * category at the end of the list.
 *
 * @param {Object} a first category
 * @param {Object} b second category
 * @returns {number} sort value
 */
const sortChildByName = (a, b) => {
  const aName = a.cat_name || "";
  const bName = b.cat_name || "";
  const aIsOther = aName.toLowerCase() === OTHERS_CATEGORY_NAME;
  const bIsOther = bName.toLowerCase() === OTHERS_CATEGORY_NAME;

  if (aIsOther && !bIsOther) return 1;
  if (bIsOther && !aIsOther) return -1;

  return aName.localeCompare(bName);
};

/**
 * Build the nested category menu out of the flat list returned by the model.
 *
 * @param {Array<Object>} categories rows returned by categoryModel.find()
 * @returns {Array<Object>} parent categories sorted by cat_sort, each with `childs`
 */
const buildCategoryTree = (categories = []) => {
  const parents = categories.filter((cat) => cat.cat_parent_id === 0);

  return parents.sort(sortParentByCatSort).map((parent) =>
    Object.assign(parent, {
      childs: categories
        .filter((cat) => cat.cat_parent_id === parent.cat_id)
        .sort(sortChildByName),
    }),
  );
};

module.exports = { sortParentByCatSort, sortChildByName, buildCategoryTree };
