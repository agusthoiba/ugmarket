require('dotenv').config()


const config = {
    protocol: process.env.APP_PROTOCOL,
    host: process.env.APP_HOST,
    port: process.env.APP_PORT,
    db: {
        "host": process.env.DB_HOST,
        "port": process.env.DB_PORT,
        "name": process.env.DB_NAME, 
        "username": process.env.DB_USERNAME, 
        "password": process.env.DB_PASSWORD
    },
    "file_host": "http://0.0.0.0:4000",
    "file_dir": "/home/ugmarket/public/"
}


module.exports = config;