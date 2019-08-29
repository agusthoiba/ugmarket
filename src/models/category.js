
const Sequelize = require('sequelize') 

class Category {
  constructor (args) {
    Object.assign(this, args)

    this.tableName = 'category'
    this.schema = this.db.define('category', {
      cat_id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      cat_slug: { type: Sequelize.STRING, allowNull: false },
      cat_name: { type: Sequelize.STRING, allowNull: false },
      cat_parent_id: { type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false, defaultValue: 0 },
      cat_parent_rank: { type: Sequelize.INTEGER(11).UNSIGNED, allowNull: false, defaultValue: 0 },
      cat_image: { type: Sequelize.STRING, allowNull: true },
      cat_icon: { type: Sequelize.STRING, allowNull: true },

      cat_is_visible: { type: Sequelize.TINYINT(1), defaultValue: 0 },
      cat_is_deleted: { type: Sequelize.TINYINT(1), defaultValue: 0 },

      cat_sort: { type: Sequelize.TINYINT(2).UNSIGNED, allowNull: false, defaultValue: 0 },
      cat_created_at: { type: Sequelize.DATE },
      cat_updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }, {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: this.tableName
    })

    this.schema.sync()

    // this.schema.belongsTo(categoryModel.schema, {foreignKey: 'prod_cat_id', targetKey: 'cat_id', as: 'category'})
  }

  find (query) {
    return new Promise((resolve, reject) => {
      this.schema.findAll({
        where: query
      }).then(result => {
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }

  findFromParent (parentId = 0) {
    return new Promise((resolve, reject) => {
      this.schema.find({
        where: { cat_parent_id: parentId },
        order: ['cat_sort', 'asc']
      }).then(result => {
        // if (parentId == )
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }

  findOne (query) {
    return new Promise((resolve, reject) => {
      this.schema.findOne({
        where: query
      }).then(result => {
        resolve(result)
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
      this.schema.update(query, payload).then(result => {
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }
}

module.exports = Category;
