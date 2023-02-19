
const Sequelize = require('sequelize') 

class Genre {
  constructor (args) {
    Object.assign(this, args)

    this.tableName = 'genres'
    this.schema = this.db.define('genres', {
      id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, autoIncrement: true },
      genre_name: { type: Sequelize.STRING, allowNull: false },
      genre_slug: { type: Sequelize.STRING, allowNull: false },
      genre_logo: { type: Sequelize.STRING, allowNull: false },
      
      //createdAt: { type: Sequelize.DATE },
      //updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
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
        where: query,
        // sort: {cat_parent_rank: 'as'},
        raw: true
      }).then(result => {
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

module.exports = Genre;
