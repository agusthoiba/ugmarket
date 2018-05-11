
const db = require('../connect');
const Sequelize = require('sequelize');

class Product {
    constructor() {
        this.tableName = 'product';
        this.schema = db.define('product', {
            prod_id: {type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true},
            prod_user_id: {type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false},
            prod_name: {type: Sequelize.STRING, allowNull: false},
            prod_slug: {type: Sequelize.STRING, allowNull: false},
            prod_cat_id: {type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false},
            prod_band_id: {type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false, defaultValue: 0},

            prod_image: {type: Sequelize.STRING},
            prod_thumbnail: {type: Sequelize.STRING},

            prod_price: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
            prod_weight: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
            prod_desc: {type: Sequelize.TEXT, allowNull: false},

            prod_is_featured: {type: Sequelize.TINYINT(1), defaultValue: 0},
            prod_is_visible: {type: Sequelize.TINYINT(1), defaultValue: 0},
            prod_is_deleted: {type: Sequelize.TINYINT(1), defaultValue: 0},

            prod_condition: {type: Sequelize.ENUM('b','s',''), defaultValue: ''},
            prod_stock: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},

            prod_created_at: {type: Sequelize.DATE},
            prod_updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW}
        }, {
            timestamps: false,
            underscored: true,
            freezeTableName: true,
            tableName: this.tableName
        });

        this.schemaProdImage = db.define('product_image', {
            pim_id: {type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true},
            pim_prod_id: {type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false},
            pim_image: {type: Sequelize.STRING, allowNull: false},
            pim_thumbnail: {type: Sequelize.STRING, allowNull: false},
        }, {
            timestamps: false,
            underscored: true,
            freezeTableName: true,
            tableName: this.tableName
        });

        //this.schema.sync();
        this.schemaProdImage.sync();
    }

  find(query, options) {
      return new Promise((resolve, reject) => {
          this.schema.findAndCountAll({
              where: query, 
              //order: options.sort,
              //offset: options.page - 1 * options.limit,
              //limit: options.limit
          }).then(result => {
              resolve(result);
          }, (err) => {
              reject(err);
          });
      });
  }

  findOne(query) {
      return new Promise((resolve, reject) => {
          this.schema.findOne({
              where: query, 
          }).then(result => {
              resolve(result);
          }, (err) => {
              reject(err);
          });
      });
  }

  create(payload) {
      return new Promise((resolve, reject) => {
          this.schema.create(payload).then(result => {
              resolve(result);
          }, (err) => {
              reject(err);
          });
      });
  }

  update(query, payload) {
      return new Promise((resolve, reject) => {
          this.schema.update(query, payload).then(result => {
              resolve(result);
          }, (err) => {
              reject(err);
          });
      });
  }
}

module.exports = new Product();
