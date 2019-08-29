const Sequelize = require('sequelize');

class Band {
  constructor(args) {
    Object.assign(this, args)
    this.tableName = 'band';
    this.schema = this.db.define('band', {
      band_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      band_name: { type: Sequelize.STRING, allowNull: false },
      band_slug: { type: Sequelize.STRING, allowNull: false },
      band_image: { type: Sequelize.STRING, allowNull: true },
      band_logo: { type: Sequelize.STRING, allowNull: true },
      band_icon: { type: Sequelize.STRING, allowNull: true },

      band_total_product: { type: Sequelize.INTEGER(11).UNSIGNED, defaultValue: 0 },

      band_created_at: { type: Sequelize.DATE },
      band_updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }, {
        timestamps: false,
        underscored: true,
        freezeTableName: true,
        tableName: this.tableName
      });

    this.schema.sync();
  }

  find(query, options) {
    const page = options ? options.page : 1;
    const limit = options ? options.limit : 20;
    const order = options ? options.order : [['band_name', 'ASC']];
    return new Promise((resolve, reject) => {
      this.schema.findAndCountAll({
        where: query,
        order: order,
        offset: (page - 1) * limit,
        limit: limit
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
      this.schema.update(payload, { where: query }).then(result => {
        resolve(result);
      }, (err) => {
        reject(err);
      });
    });
  }

  remove(query) {
    return new Promise((resolve, reject) => {
      this.schema.update(payload, { where: query }).then(result => {
        resolve(result);
      }, (err) => {
        reject(err);
      });
    });
  }
}

module.exports = Band;
