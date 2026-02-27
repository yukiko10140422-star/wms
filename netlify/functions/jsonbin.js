// Netlify Function: JSONBin proxy
// Keeps the API key server-side and avoids browser CORS issues

const BIN_ID = '69a1961fae596e708f4f49b8';
const API_KEY = '$2a$10$MzMkLRuDU9fhLvkwm.fuWO/wd6dr.n3GZbQm0BA3YzegoDR1wJ3D.';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

exports.handler = async (event) => {
  const method = event.httpMethod;
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  };

  // Preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  try {
    let response;

    if (method === 'GET') {
      // Read latest bin
      response = await fetch(`${BASE_URL}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': API_KEY,
          'X-Bin-Meta': 'false',
        },
      });
    } else if (method === 'PUT') {
      // Update bin
      response = await fetch(BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
          'X-Bin-Versioning': 'false',
        },
        body: event.body,
      });
    } else {
      return {
        statusCode: 405,
        headers: cors,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const text = await response.text();
    return {
      statusCode: response.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
