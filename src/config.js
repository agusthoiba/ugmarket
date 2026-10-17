require('dotenv').config()

const env = process.env;

const config = {
    protocol: env.APP_PROTOCOL,
    host: env.APP_HOST,
    port: env.PORT,
    domain: env.APP_DOMAIN,
    db: {
        mysql: {
            url: env.DB_MYSQL_URL,
            host: env.DB_HOST,
            port: env.DB_PORT,
            user: env.DB_USER,
            name: env.DB_NAME,
            password: env.DB_PASSWORD
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
    },
    google: {
        apiKey: env.GOOGLE_API_KEY,
        mapsUrl: env.GOOGLE_MAPS_URL,
        oauth: {
            clientId: env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
            redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI
        }
    },
    cloudflare: {
        siteKey: env.CLOUDFLARE_SITE_KEY
    },
    resend: {
        apiKey: env.RESEND_API_KEY,
        from: env.RESEND_FROM || 'noreply@undergroundsync.com'
    }
}


module.exports = config;