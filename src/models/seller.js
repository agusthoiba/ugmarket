const Sequelize = require('sequelize');
const _ = require('underscore')

class Seller {
  constructor (args) {
    Object.assign(this, args)

    this.tableName = 'sellers';
    this.schema = this.db.define('sellers', {
      sel_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      sel_user_id: { 
        type: Sequelize.INTEGER(11).UNSIGNED, 
        allowNull: false,
        references: {
          model: this.user.schema,
          key: 'user_id'
        }
      },
      sel_name: { type: Sequelize.STRING, allowNull: false },
      sel_phone: { type: Sequelize.STRING(20), allowNull: false },
      sel_avatar: { type: Sequelize.STRING },
      sel_banner: { type: Sequelize.STRING },
      sel_description: { type: Sequelize.TEXT },
      sel_address_province_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
      sel_address_city_id: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
      sel_address_district_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      sel_address_village_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      sel_address_zipcode: { type: Sequelize.STRING(5), allowNull: true },
      sel_address_street: { type: Sequelize.TEXT, allowNull: true },
      sel_address_lat: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      sel_address_lng: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      sel_is_active: { type: Sequelize.TINYINT(1), defaultValue: 1 },
      sel_created_at: { type: Sequelize.DATE, allowNull: false },
      sel_updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }, {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: this.tableName
    });

    this.schema.sync()
  }

  async create (payload) {
    return await this.schema.create(payload);
  }

  async update (query, payload) {
    return await this.schema.update(payload, { where: query })
  }

  async upsert (query, payload) {
    const existing = await this.schema.findOne({ where: query });
    console.log('existing seller: ', existing); //existing
    if (existing) {
      return await this.schema.update(payload, { where: query });
    } 
    return await this.schema.create(payload)
  }

  async findOne (query) {
    return await this.schema.findOne({
      where: query
    });
  }
}

module.exports = Seller;
