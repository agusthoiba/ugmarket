const Sequelize = require('sequelize');
const moment = require('moment');

class Band {
  constructor(args) {
    Object.assign(this, args)
    this.tableName = 'band';
    this.schema = this.db.define('band', {
      band_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      band_name: { type: Sequelize.STRING, allowNull: false },
      band_desc: { type: Sequelize.TEXT, allowNull: true },
      band_slug: { type: Sequelize.STRING, allowNull: false },
      band_image: { type: Sequelize.STRING, allowNull: true },
      band_logo: { type: Sequelize.STRING, allowNull: true },
      band_icon: { type: Sequelize.STRING, allowNull: true },
      band_genre: { type: Sequelize.STRING, allowNull: true },

      band_enabled: { type: Sequelize.TINYINT, allowNull: false, default: 0},
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

  async find(query, options) {
    const opts = {
      page: 1,
      limit: 20,
      order: [['band_name', 'ASC']]
    }
    
    if (options) {
      if (options.page) { opts.page =  options.page };
      if (options.limit) { opts.limit =  options.limit };
      if (options.sort) { opts.order = options.sort };
    }

    const result = await this.schema.findAll({
        where: query,
        raw: true,
        order: opts.order,
        offset: (opts.page - 1) * opts.limit,
        limit: opts.limit
    });

    return result;
  }

  findOne(query) {
    return new Promise((resolve, reject) => {
      this.schema.findOne({
        where: query,
        raw: true
      }).then(result => {
        resolve(result);
      }, (err) => {
        reject(err);
      });
    });
  }

  create(payload) {
    const payloads = Object.assign(payload, {
      band_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      band_updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
    });

    return new Promise((resolve, reject) => {
      this.schema.create(payloads).then(result => {
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

  async count(query) {
    let obj = {
      where: query
    }
    const countBand =  await this.schema.count(obj);

    return countBand;
  }
}

module.exports = Band;
