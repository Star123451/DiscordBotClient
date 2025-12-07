/**
 * Vercel Serverless Function: Discord API Proxy
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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse the request body
    const { endpoint, method = 'GET', body, token } = req.body;

    // Validate required fields
    if (!endpoint || !token) {
      return res.status(400).json({ 
        error: 'Missing required fields: endpoint and token' 
      });
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
    return res.status(response.status).json({
      status: response.status,
      data: data,
      ok: response.ok
    });
  } catch (error) {
    console.error('Discord API Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
}
