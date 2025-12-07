/**
 * Netlify Function: Discord API Proxy
 * 
 * This serverless function acts as a proxy between the web client and Discord API
 * to avoid CORS issues when making requests directly from the browser.
 * 
 * SECURITY NOTE:
 * - Uses wildcard CORS ('*') to allow any origin for ease of deployment
 * - Bot tokens are passed through this proxy on every request
 * - Only use with test/development bots without sensitive permissions
 * - For production use, consider implementing:
 *   1. Origin validation against a whitelist
 *   2. Rate limiting per IP/origin
 *   3. Token validation/authorization
 *   4. Request logging for security audit
 */

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { endpoint, method = 'GET', body, token } = JSON.parse(event.body);

    // Validate required fields
    if (!endpoint || !token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: endpoint and token' })
      };
    }

    // Construct the Discord API URL
    const url = `https://discord.com/api/v10${endpoint}`;

    // Prepare request options
    const options = {
      method: method,
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBotClient-Web/1.0'
      }
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    // Make the request to Discord API
    const response = await fetch(url, options);

    // Get response data
    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (response.status !== 204) {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    }

    // Return the response
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        status: response.status,
        data: data,
        ok: response.ok
      })
    };
  } catch (error) {
    console.error('Discord API Proxy Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      })
    };
  }
};
