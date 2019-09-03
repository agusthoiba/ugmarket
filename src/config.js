require('dotenv').config()

const env = process.env;

const config = {
    protocol: env.APP_PROTOCOL,
    host: env.APP_HOST,
    port: env.APP_PORT,
    db: {
        "host": env.DB_HOST,
        "port": env.DB_PORT,
        "name": env.DB_NAME, 
        "username": env.DB_USERNAME, 
        "password": env.DB_PASSWORD
    },
    file_host: "http://0.0.0.0:4000",
    file_dir: "/home/ugmarket/public/",
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