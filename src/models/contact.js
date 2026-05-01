const Sequelize = require('sequelize');

class Contact {
  constructor(args) {
    Object.assign(this, args)
    this.tableName = 'contacts';
    this.schema = this.db.define('contacts', {
      id: { type: Sequelize.INTEGER(11), primaryKey: true, autoIncrement: true },
      ct_name: { type: Sequelize.STRING, allowNull: false },
      ct_email: { type: Sequelize.STRING, allowNull: false },
      ct_hp: { type: Sequelize.STRING(13), allowNull: true },
      ct_message: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false},
      updatedAt: { allowNull: false, type: Sequelize.DATE}
    }, {
        timestamps: true,
        //underscored: true,
        freezeTableName: true,
        tableName: this.tableName
      });

    this.schema.sync()
  }

  async create(payload) {
    return await this.schema.create(payload)
  }

}

module.exports = Contact;
