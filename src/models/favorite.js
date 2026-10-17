
const Sequelize = require('sequelize');

class Favorite {
  constructor (args) {
    Object.assign(this, args);

    this.tableName = 'favorite';
    this.schema = this.db.define('favorite', {
      fav_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      fav_user_id: { 
        type: Sequelize.INTEGER(11).UNSIGNED, 
        allowNull: false,
        references: {
          model: this.user.schema,
          key: 'user_id'
        }
      },
      fav_prod_id: { 
        type: Sequelize.INTEGER(11).UNSIGNED, 
        allowNull: false,
        references: {
          model: this.product.schema,
          key: 'prod_id'
        }
      },
      fav_created_at: { type: Sequelize.DATE },
    }, {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: this.tableName
    });

    this.schema.sync();
    this.schema.belongsTo(this.user.schema, { foreignKey: 'fav_user_id', targetKey: 'user_id', as: 'user' });
    this.schema.belongsTo(this.product.schema, { foreignKey: 'fav_prod_id', targetKey: 'prod_id', as: 'product' });
  }

  async find (query, options = {}) {
    let params = {
      where: query,
      raw: true,
      include: [
        {
          model: this.user.schema,
          as: 'user'
        },
        {
          model: this.product.schema,
          as: 'product',
          include: [
            {
              model: this.user.schema,
              as: 'user'
            },
            {
              model: this.band.schema,
              as: 'band',
              required: true
            }
          ]
        }
      ]
    };

    if (options.sort) {
      params.order = options.sort;
    }

    if (options.limit && !isNaN(options.limit) && options.limit > 0) {
      params.limit = options.limit;
      if (options.page && !isNaN(options.page) && options.page > 0) {
        params.offset = (options.page - 1) * options.limit;
      }
    }

    const result = await this.schema.findAll(params);
    return result;
  }

  async findOne (query) {
    const data = await this.schema.findOne({
      where: query,
      raw: true
    });
    return data;
  }

  async count (query) {
    const total = await this.schema.count({ where: query });
    return total;
  }

  async create (payload) {
    const row = await this.schema.create(payload);
    return row;
  }

  async remove (query) {
    const del = await this.schema.destroy({
      where: query,
      force: true
    });
    return del;
  }
}

module.exports = Favorite;
