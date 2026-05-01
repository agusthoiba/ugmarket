
const Sequelize = require('sequelize') 

class Collections {
  constructor (args) {
    Object.assign(this, args)

    this.tableName = 'collections'
    this.schema = this.db.define('collections', {
      col_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      col_slug: { type: Sequelize.STRING, allowNull: false },
      col_name: { type: Sequelize.STRING, allowNull: false },
      col_desc: { type: Sequelize.TEXT, allowNull: true },
      col_thumbnail: { type: Sequelize.STRING, allowNull: true },
      col_banner_desktop: { type: Sequelize.STRING, allowNull: true },
      col_banner_mobile: { type: Sequelize.STRING, allowNull: true },
      col_banner_isdisplay_home: { type: Sequelize.TINYINT(1), defaultValue: 0 },       
      col_is_visible: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      col_sort: { type: Sequelize.TINYINT(2).UNSIGNED, allowNull: false, defaultValue: 0 },

      col_total_products: { type: Sequelize.INTEGER(11).UNSIGNED, defaultValue: 0 },

      col_is_deleted: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      col_created_at: { type: Sequelize.DATE },
      col_updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      col_deleted_at: { type: Sequelize.DATE, allowNull: true }
    }, {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: this.tableName,
      paranoid: true, // Enable soft deletes
      deletedAt: 'col_deleted_at' // Custom column name (optional)
    })

    this.schema.sync()
  }

  async find (query) {
    try {
      const result = await this.schema.findAll({
        where: query,
        sort: {col_sort: 'asc'},
        raw: true
      })
      return result;
    } catch (err) {
      throw err;
    }
  }

  async findOne (query) {
    try {
      const result = await this.schema.findOne({
        where: query
      });
      return result;
    } catch (err) {
      throw err;
    }
  }

  async create (payload) {
    try {
      const result = await this.schema.create(payload)
      return result;
    } catch (err) {
      throw err;
    }
  }
  
  async update (query, payload) {
    try {
      return this.schema.update(payload, {where: query});
    } catch (err) {
      throw err;
    }
  }

  async softDelete (query) {
    try {
      return this.schema.destroy({where: query});
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Collections;