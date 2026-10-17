const axios = require('axios');

async function getGoogleAccessToken(client, redirectUri, code) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: client.id,
        client_secret: client.secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }
    });
    return response;
  } catch (error) {
    console.error(error);
    throw new Error('Error getting Google access token');
  }
}

async function getGoogleUserInfo(accessToken) {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response;
  } catch (error) {
    console.error(error);
    throw new Error('Error getting Google user info');
  }
}

module.exports = { getGoogleAccessToken, getGoogleUserInfo };
