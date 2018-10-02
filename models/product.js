
const db = require('../connect');
const Sequelize = require('sequelize');
const categoryModel = require('./category')
const bandModel = require('./band')

class Product {
  constructor () {
    this.tableName = 'product';
    this.schema = db.define('product', {
      prod_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      prod_user_id: { type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false },
      prod_name: { type: Sequelize.STRING, allowNull: false },
      prod_slug: { type: Sequelize.STRING, allowNull: false },
      prod_cat_id: { type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false },
      prod_band_id: { type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false, defaultValue: 0 },

      prod_images: { type: Sequelize.TEXT },
      prod_thumbnails: { type: Sequelize.TEXT },
      prod_sizes_available: { type: Sequelize.STRING },
      prod_price: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      prod_weight: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      prod_desc: { type: Sequelize.TEXT, allowNull: false },

      prod_is_featured: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      prod_is_visible: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      prod_is_deleted: { type: Sequelize.TINYINT(1), defaultValue: 0 },

      prod_condition: { type: Sequelize.ENUM('b', 's', ''), defaultValue: '' },
      prod_stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },

      prod_created_at: { type: Sequelize.DATE },
      prod_updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    }, {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: this.tableName
    })

    this.schema.sync()
    this.schema.belongsTo(categoryModel.schema, { foreignKey: 'prod_cat_id', targetKey: 'cat_id', as: 'category' })
    this.schema.belongsTo(bandModel.schema, { foreignKey: 'prod_band_id', targetKey: 'band_id', as: 'band' })
  }

  find (query, options) {
    let obj = {
      where: query,
      include: [
        {
          model: categoryModel.schema,
          as: 'category'
        },
        {
          model: bandModel.schema,
          as: 'band'
        },
      ]
    }

    if (options !== undefined && options && _.isEmpty(options)) {
      if (options.sort !== undefined && options.sort) {
        obj.order = options.sort
      }
      if (options.limit !== undefined && options.limit && !isNaN(options.limit) && options.limit > 0) {
        obj.limit = options.limit
        if (options.page !== undefined && options.page && !isNaN(options.page) && options.page > 0) {
          obj.offset = options.page - 1 * options.limit
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.schema.find(obj).then(result => {
        const data = JSON.parse(JSON.stringify(result))
        resolve(data)
      }, (err) => {
        reject(err)
      })
    })
  }

  findOne (query) {
    return new Promise((resolve, reject) => {
      this.schema.findOne({
        where: query,
        include: [
          {
            model: categoryModel.schema,
            as: 'category'
          },
          {
            model: bandModel.schema,
            as: 'band'
          },
        ]
      }).then(result => {
        resolve(result);
      }, (err) => {
        reject(err);
      });
    });
  }

  /**
   * Product find one by Id
   * @param {Int} id
   */
  findOneById (id) {
    return new Promise((resolve, reject) => {
      return this.schema.findOne({
        where: { prod_id: id },
        include: [
          {
            model: categoryModel.schema,
            as: 'category'
          },
          {
            model: bandModel.schema,
            as: 'band'
          }
        ]
      }).then(result => {
        const datum = JSON.parse(JSON.stringify(result))
        resolve(datum)
      }, (err) => {
        reject(err)
      })
    })
  }

  create (payload) {
    return new Promise((resolve, reject) => {
      this.schema.create(payload).then(result => {
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }

  update (query, payload) {
    return new Promise((resolve, reject) => {
      this.schema.update(payload, { where: query }).then(result => {
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }
}

module.exports = new Product()
