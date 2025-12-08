/**
 * Cloudflare Workers Function: Discord API Proxy
 * 
 * This serverless function acts as a proxy between the web client and Discord API
 * to avoid CORS issues when making requests directly from the browser.
 * 
 * For Cloudflare Pages, place this file in /functions/discord-proxy.js
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

export async function onRequestPost(context) {
  const { request } = context;

  try {
    // Parse the request body
    const { endpoint, method = 'GET', body, token } = await request.json();

    // Validate required fields
    if (!endpoint || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: endpoint and token' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
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
    return new Response(
      JSON.stringify({
        status: response.status,
        data: data,
        ok: response.ok
      }),
      {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        }
      }
    );
  } catch (error) {
    console.error('Discord API Proxy Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Handle OPTIONS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
