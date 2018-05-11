
const db = require('../connect');
const Sequelize = require('sequelize');

class User {
    constructor() {
        this.tableName = 'user';
        this.schema = db.define('user', {
            user_id: {type: Sequelize.INTEGER(11).UNSIGNED , primaryKey: true, autoIncrement: true},
            user_email: {type: Sequelize.STRING, allowNull: false, unique: true},
            user_username: {type: Sequelize.STRING(100)},
            user_name: {type: Sequelize.STRING},
            user_gender: {type: Sequelize.ENUM('m','f',''), defaultValue: ''},
            user_password: {type: Sequelize.STRING},
            user_hp: {type: Sequelize.STRING(20)},
            user_avatar: {type: Sequelize.STRING},
            user_is_verified: {type: Sequelize.TINYINT(1), defaultValue: 0},
            user_is_deleted: {type: Sequelize.TINYINT(1), defaultValue: 0},
            user_created_at: {type: Sequelize.DATE},
            user_updated_at: {type: Sequelize.DATE, defaultValue: Sequelize.NOW}
        }, {
            timestamps: false,
            underscored: true,
            freezeTableName: true,
            tableName: this.tableName
        });
        //this.schema.sync();
    }

    find(query, options) {
        return new Promise((resolve, reject) => {
            this.schema.findAndCountAll({
                where: query, 
                order: options.sort,
                offset: options.page - 1 * options.limit,
                limit: options.limit
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
            }, err => {
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
            this.schema.update(payload, {
                where: query, 
            }).then(result => {
                resolve(result);
            }, (err) => {
                reject(err);
            });
        });
    }
}

module.exports = new User();
