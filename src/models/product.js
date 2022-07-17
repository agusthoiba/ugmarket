
const Sequelize = require('sequelize');
const categoryModel = require('./category')
const bandModel = require('./band')

class Product {
  constructor (args) {
    Object.assign(this, args);


    this.tableName = 'product';
    this.schema = this.db.define('product', {
      prod_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      prod_user_id: { 
        type: Sequelize.INTEGER(11).UNSIGNED, 
        allowNull: false,
        references: {
          // This is a reference to another model
          model: this.user.schema,
     
          // This is the column name of the referenced model
          key: 'user_id'
        }
      },
      prod_name: { type: Sequelize.STRING, allowNull: false },
      prod_slug: { type: Sequelize.STRING, allowNull: false },
      prod_cat_id: { 
        type: Sequelize.INTEGER(11).UNSIGNED, 
        allowNull: false,
        references: {
          // This is a reference to another model
          model: this.category.schema,
     
          // This is the column name of the referenced model
          key: 'cat_id'
        }
      },
      prod_band_id: { 
        type: Sequelize.INTEGER(11).UNSIGNED, 
        allowNull: false, 
        defaultValue: 0,
        references: {
          // This is a reference to another model
          model: this.band.schema,
     
          // This is the column name of the referenced model
          key: 'cat_id'
        }
      },
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
    this.schema.belongsTo(this.user.schema, { foreignKey: 'prod_user_id', targetKey: 'user_id', as: 'user' })
    this.schema.belongsTo(this.category.schema, { foreignKey: 'prod_cat_id', targetKey: 'cat_id', as: 'category' })
    this.schema.belongsTo(this.band.schema, { foreignKey: 'prod_band_id', targetKey: 'band_id', as: 'band' })
  }

  async count(query) {
    let obj = {
      where: query
    }
    const countProd =  await this.schema.count(obj);

    return countProd;
  }

  async find (query, options) {
    let obj = {
      where: query,
      raw: true,
      include: [
        {
          model: this.category.schema,
          as: 'category'
         
        },
        {
          model: this.band.schema,
          as: 'band',
          required: true
        }
      ],
      limit: 20,
      offset: 0
    }

    if (!_.isEmpty(options)) {
      if (options.sort) {
        obj.order = options.sort
      }
      if (options.limit && !isNaN(options.limit) && options.limit > 0) {
        obj.limit = options.limit
        if (options.page && !isNaN(options.page) && options.page > 0) {
          obj.offset = (options.page - 1) * options.limit
        }
      }
    }

    let products;
    try {
      products = await this.schema.findAll(obj)
    } catch (e) {
      throw new Error(e);
    }

    return products;
  }

  async findOne (query) {
    let product;
    try {
      product = await this.schema.findOne({
        where: query,
        raw: true,
        include: [
          {
            model: this.user.schema,
            as: 'user'
          },
          {
            model: this.category.schema,
            as: 'category'
          },
          {
            model: this.band.schema,
            as: 'band'
          }
        ]
      });
      
    } catch (e) {
      throw new Error(e)
    }
    return product
  }

  async create (payload) {
    let insertObj;
    try {
      insertObj = this.schema.create(payload)
    } catch (e) {
      throw new Error(e)
    }
    return insertObj
  }

  async update (query, payload) {
    let updateObj
    try {
      updateObj = this.schema.update(payload, { where: query })
    } catch (e) {
      throw new Error(e)
    }
    return updateObj
  }

  /**
   * Count 
   * Be carefull in innodb storage engine count query dangerous!
   * @param {object} filter filter
   */
  async count (filter) {
    try {
      const productAmount = await this.schema.count({
        where: filter,
        include: [
          {
            model: this.band.schema,
            as: 'band',
            required: true
          }
        ]
      });
      return productAmount;
    } catch (e) {
      throw new Error(e)
    };
  }
}

module.exports = Product
