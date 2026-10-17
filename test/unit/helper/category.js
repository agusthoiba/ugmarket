const { expect } = require('chai');

const {
  buildCategoryTree,
  sortParentByCatSort,
  sortChildByName,
} = require('../../../src/helpers/category');

const parents = [
  { cat_id: 3, cat_name: 'Figure', cat_parent_id: 0, cat_sort: 3 },
  { cat_id: 1, cat_name: 'Pakaian', cat_parent_id: 0, cat_sort: 1 },
  { cat_id: 9, cat_name: 'Vinyl', cat_parent_id: 0, cat_sort: 2 },
];

const children = [
  { cat_id: 11, cat_name: 'Kemeja', cat_parent_id: 1, cat_sort: 0 },
  { cat_id: 10, cat_name: 'Kaos', cat_parent_id: 1, cat_sort: 0 },
  { cat_id: 12, cat_name: 'Others', cat_parent_id: 1, cat_sort: 0 },
  { cat_id: 13, cat_name: 'Album', cat_parent_id: 9, cat_sort: 0 },
];

const clone = (rows) => rows.map((row) => Object.assign({}, row));

describe('category helper test', () => {
  describe('sortParentByCatSort', () => {
    it('should order the parent categories by cat_sort', () => {
      const sorted = clone(parents).sort(sortParentByCatSort);

      expect(sorted.map((cat) => cat.cat_sort)).to.deep.equal([1, 2, 3]);
      expect(sorted.map((cat) => cat.cat_name)).to.deep.equal([
        'Pakaian',
        'Vinyl',
        'Figure',
      ]);
    });

    it('should treat a missing cat_sort as zero', () => {
      const sorted = clone([
        { cat_id: 1, cat_name: 'Pakaian', cat_sort: 5 },
        { cat_id: 2, cat_name: 'Figure' },
      ]).sort(sortParentByCatSort);

      expect(sorted.map((cat) => cat.cat_name)).to.deep.equal([
        'Figure',
        'Pakaian',
      ]);
    });
  });

  describe('sortChildByName', () => {
    it('should put the Others category at the end of the list', () => {
      const sorted = clone(children.slice(0, 3)).sort(sortChildByName);

      expect(sorted.map((cat) => cat.cat_name)).to.deep.equal([
        'Kaos',
        'Kemeja',
        'Others',
      ]);
    });

    it('should keep the Others category at the end whatever the case', () => {
      const sorted = clone([
        { cat_id: 1, cat_name: 'Zine' },
        { cat_id: 2, cat_name: 'others' },
        { cat_id: 3, cat_name: 'Aksesoris' },
      ]).sort(sortChildByName);

      expect(sorted.map((cat) => cat.cat_name)).to.deep.equal([
        'Aksesoris',
        'Zine',
        'others',
      ]);
    });
  });

  describe('buildCategoryTree', () => {
    it('should return the parent categories ordered by cat_sort', () => {
      const tree = buildCategoryTree(clone(parents).concat(clone(children)));

      expect(tree.map((cat) => cat.cat_name)).to.deep.equal([
        'Pakaian',
        'Vinyl',
        'Figure',
      ]);
      expect(tree.every((cat) => cat.cat_parent_id === 0)).to.equal(true);
    });

    it('should nest every child under its own parent', () => {
      const tree = buildCategoryTree(clone(parents).concat(clone(children)));
      const pakaian = tree.find((cat) => cat.cat_id === 1);
      const vinyl = tree.find((cat) => cat.cat_id === 9);
      const figure = tree.find((cat) => cat.cat_id === 3);

      expect(pakaian.childs.map((cat) => cat.cat_name)).to.deep.equal([
        'Kaos',
        'Kemeja',
        'Others',
      ]);
      expect(vinyl.childs.map((cat) => cat.cat_name)).to.deep.equal(['Album']);
      expect(figure.childs).to.deep.equal([]);
    });

    it('should not add a childs key to the child categories', () => {
      const rows = clone(parents).concat(clone(children));
      buildCategoryTree(rows);

      const childRows = rows.filter((cat) => cat.cat_parent_id !== 0);
      const parentRows = rows.filter((cat) => cat.cat_parent_id === 0);

      expect(childRows.every((cat) => cat.childs === undefined)).to.equal(true);
      expect(parentRows.some((cat) => cat.childs)).to.equal(true);
    });

    it('should return an empty list when there is no category', () => {
      expect(buildCategoryTree()).to.deep.equal([]);
      expect(buildCategoryTree([])).to.deep.equal([]);
    });

    it('should ignore a category whose parent is not a top level category', () => {
      const tree = buildCategoryTree(
        clone(children).concat([
          { cat_id: 20, cat_name: 'Oversize', cat_parent_id: 10, cat_sort: 0 },
        ]),
      );

      expect(tree).to.deep.equal([]);
    });
  });
});
