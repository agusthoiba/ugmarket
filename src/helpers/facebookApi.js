const axios = require('axios');

async function getFbAccessToken(graphFbUrl, client, redirectUri, code) {
  const url = `${graphFbUrl}/oauth/access_token`
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      client_id: client.id,
      redirect_uri: redirectUri,
      client_secret: client.secret,
      code: code
    }
  };
  

  try {
    const response = await axios.get(url, options);
    return response
  } catch (error) {
    console.error(error);
    throw new Error('Error callback login facebook')
  }
}

async function inspectFbToken(graphFbUrl, tokenType, accessToken) {
  const url = `${graphFbUrl}/debug_token?input_token=${tokenType}&access_token=${accessToken}`;
  try {
    const response = await axios.get(url);
    return response
  } catch (error) {
    console.error(error);
    throw new Error('Error callback login facebook')
  }
}

async function graphApiGet(graphFbUrl, path, accessToken, fields = []) {
  const url = `${graphFbUrl}/${path}?fields=${fields.join(',')}&access_token=${accessToken}`;
  try {
    const response = await axios.get(url);
    return response
  } catch (error) {
    console.error(error);
    throw new Error('Error graphApi facebook')
  }
}

module.exports = {
  getFbAccessToken,
  inspectFbToken,
  graphApiGet
};
