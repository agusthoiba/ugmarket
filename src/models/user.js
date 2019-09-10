
const db = require('../connect');
const Sequelize = require('sequelize');
const _ = require('underscore')

class User {
  constructor (args) {
    Object.assign(this, args)

    this.tableName = 'user'

    this.schema = this.db.define('user', {
      user_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      user_email: { type: Sequelize.STRING },
      user_username: { type: Sequelize.STRING(100) },
      user_name: { type: Sequelize.STRING },
      user_gender: { type: Sequelize.ENUM('m', 'f', ''), defaultValue: '' },
      user_password: { type: Sequelize.STRING },
      user_hp: { type: Sequelize.STRING(20) },
      user_avatar: { type: Sequelize.STRING },
      user_facebook_id: { type: Sequelize.STRING },
      user_is_verified: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      user_is_deleted: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      user_created_at: { type: Sequelize.DATE },
      user_updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }, {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: this.tableName
    })

    this.schema.sync();
  }

  async create (payload) {
    if (typeof payload === 'undefined' || typeof payload !== 'object' || !payload || _.isEmpty(payload)) {
      throw new Exception('first arguments required and must be object')
    }

    const row = await this.schema.create(payload)

    return row
  }

  async find (query = {}, options = {}) {
    let params = {}

    if (!_.isEmpty(query)) {
      params = Object.assign(params, { where: query })
    }

    if (_.isEmpty(options)) {
      if (options.sort !== undefined && options.sort && Array.isArray(options.sort)) {
        params.order = options.sort
      }

      if (options.limit !== undefined && options.limit && options.limit > 0) {
        params.limit = options.limit

        if (options.page !== undefined) {
          params.offset = options.page - 1 * options.limit
        }
      }
    }

    const result = await this.schema.findAll(params)

    return result
  }

  async findOne (query) {
    const params = {
      where: query
    }
    const data = await this.schema.findOne(params)

    return data;
  }

  async update (query, payload) {
    const row = await this.schema.update(payload, {
      where: query
    })

    return row
  }

  async remove (query) {
    const del = await this.schema.destroy({
      where: query,
      force: true
    })

    return del === undefined
  }
}

module.exports = User
