require('dotenv').config()

const env = process.env;

const config = {
    protocol: env.APP_PROTOCOL,
    host: env.APP_HOST,
    port: env.PORT,
    db: {
        mysql: {
            url: env.DB_MYSQL_URL
        }
    },
    file_host: `${env.APP_PROTOCOL}://${env.APP_HOST}:${process.env.PORT}`,
    file_dir:  env.FILE_DIR,
    facebook: {
        appOauthUrl: env.FB_APP_OAUTH_URL,
        appId: env.FB_APP_ID,
        appClientSecret: env.FB_APP_CLIENT_SECRET,
        appRedirectUri: env.FB_APP_REDIRECT_URI,
        graphBaseUrl: env.FB_GRAPH_BASEURL,
        graphOauthTokenUrl: env.FB_GRAPH_OAUTH_TOKEN_URL
    }
}


module.exports = config;