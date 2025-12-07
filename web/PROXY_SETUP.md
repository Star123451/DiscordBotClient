# Discord API Proxy Setup Guide

## Why is a Proxy Needed?

Discord's API does not allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. When you try to call Discord's API directly from a web browser, you'll get errors like:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
```

To solve this, we need a **serverless proxy** that runs on the server-side and forwards requests from the browser to Discord's API.

## Proxy Architecture

```
Browser (Web App)  -->  Serverless Function (Proxy)  -->  Discord API
                   <--                               <--
```

The proxy:
1. Receives requests from your web app
2. Adds proper authentication headers
3. Forwards the request to Discord's API
4. Returns the response back to your web app

## Platform-Specific Setup

### 🟢 Netlify

**Automatic Setup** - The proxy is already configured!

- Function file: `/netlify/functions/discord-proxy.js`
- Endpoint: `/.netlify/functions/discord-proxy`
- Configuration: `netlify.toml` (already set)

**Manual Testing:**
```bash
# Test locally with Netlify CLI
npm install -g netlify-cli
cd web
netlify dev
```

**What happens on deployment:**
- Netlify automatically detects the `functions` folder
- The function is deployed as `/.netlify/functions/discord-proxy`
- The web app automatically detects Netlify and uses this endpoint

### 🔷 Vercel

**Automatic Setup** - The proxy is already configured!

- Function file: `/api/discord-proxy.js`
- Endpoint: `/api/discord-proxy`
- Configuration: Built-in (Vercel auto-detects `/api` folder)

**Manual Testing:**
```bash
# Test locally with Vercel CLI
npm install -g vercel
cd web
vercel dev
```

**What happens on deployment:**
- Vercel automatically detects the `/api` folder
- The function is deployed as `/api/discord-proxy`
- The web app automatically detects Vercel and uses this endpoint

### 🟠 Cloudflare Pages

**Automatic Setup** - The proxy is already configured!

- Function file: `/functions/discord-proxy.js`
- Endpoint: `/discord-proxy`
- Configuration: Built-in (Cloudflare auto-detects `/functions` folder)

**Manual Testing:**
```bash
# Test locally with Wrangler
npm install -g wrangler
cd web
wrangler pages dev .
```

**What happens on deployment:**
- Cloudflare Pages automatically detects the `/functions` folder
- The function is deployed as `/discord-proxy`
- The web app automatically detects Cloudflare and uses this endpoint

### 🟡 GitHub Pages

**Manual Setup Required** - GitHub Pages doesn't support serverless functions.

You have two options:

#### Option 1: Use External Serverless Service

Deploy the proxy separately on Netlify/Vercel/Cloudflare:

1. Create a new repository with just the proxy function
2. Deploy to Netlify/Vercel/Cloudflare
3. In your GitHub Pages site, add this before loading the app:

```html
<script>
  // Set custom proxy URL before app loads
  window.DISCORD_PROXY_URL = 'https://your-proxy.netlify.app/.netlify/functions/discord-proxy';
</script>
```

#### Option 2: Deploy to Netlify/Vercel Instead

Switch to Netlify or Vercel for zero-config proxy support.

### 🔴 Other Platforms (Render, Firebase, etc.)

For platforms without built-in serverless functions, use **Option 1** from GitHub Pages above.

## How Auto-Detection Works

The web app automatically detects which platform it's running on:

```javascript
// In discord-api.js
detectProxyURL() {
  const hostname = window.location.hostname;
  
  // Netlify
  if (hostname.includes('netlify.app')) {
    return '/.netlify/functions/discord-proxy';
  }
  
  // Vercel
  if (hostname.includes('vercel.app')) {
    return '/api/discord-proxy';
  }
  
  // Cloudflare Pages
  if (hostname.includes('pages.dev')) {
    return '/discord-proxy';
  }
  
  // Custom override
  if (window.DISCORD_PROXY_URL) {
    return window.DISCORD_PROXY_URL;
  }
  
  // Default
  return '/.netlify/functions/discord-proxy';
}
```

## Custom Proxy URL

If you're using a custom domain or different setup, you can override the proxy URL:

```html
<!-- Add this in index.html before loading app.js -->
<script>
  window.DISCORD_PROXY_URL = '/your-custom-proxy-endpoint';
</script>
```

## Security Considerations

### ⚠️ CRITICAL: Wildcard CORS

**The proxy uses wildcard CORS (`Access-Control-Allow-Origin: *`)** for ease of deployment, which means:
- Any website can potentially access your deployed proxy endpoint
- If someone discovers your proxy URL, they could use it for their own requests
- This is acceptable ONLY for test/development bots without sensitive permissions

### ✅ Safe Practices

1. **Token in Transit**: The proxy receives the bot token but doesn't store it
2. **HTTPS Only**: All requests should use HTTPS in production
3. **No Logging**: The proxy should not log tokens (already configured)
4. **Rate Limiting**: Discord's API rate limits apply
5. **Deploy Your Own**: Each user should deploy their own instance

### ⚠️ Important Security Risks

1. **Bot Token Exposure**: The token is sent from browser to proxy on every request
2. **Wildcard CORS**: Any origin can access your proxy if they know the URL
3. **No Authentication**: The proxy doesn't validate who's using it
4. **Public Endpoints**: Serverless functions are publicly accessible URLs

### 🛡️ Risk Mitigation

1. **Use Test Bots Only**: Only use with development/test bots
2. **No Admin Permissions**: Never use bots with admin/dangerous permissions
3. **Limited Scope**: Bot should only be in test servers you control
4. **Regular Token Rotation**: Regenerate bot token frequently
5. **Monitor Usage**: Check Discord Developer Portal for unusual activity
6. **Clear Storage**: Always logout when done (clears token from localStorage)

### 🔒 Production Recommendations

For production bots, DO NOT use this web version:
- Use the desktop Electron app instead
- Or implement proper OAuth2 flow with backend authentication
- Never expose production bot tokens in browser applications
- Consider implementing origin validation in the proxy code
- Add rate limiting per IP address
- Use environment variables for allowed origins

## Troubleshooting

### "Failed to fetch" or "NetworkError"

**Cause**: Proxy function not deployed or wrong endpoint

**Solution**:
1. Check if you're on a supported platform (Netlify/Vercel/Cloudflare)
2. Verify the function files are in the correct location
3. Check browser console for the exact error
4. Try redeploying your site

### "Missing required fields: endpoint and token"

**Cause**: Proxy received malformed request

**Solution**:
1. Clear browser cache and localStorage
2. Logout and login again
3. Check if discord-api.js is loaded correctly

### "HTTP 401: Unauthorized"

**Cause**: Invalid or expired bot token

**Solution**:
1. Check your bot token in Discord Developer Portal
2. Make sure you copied the entire token
3. Regenerate token if needed
4. Logout and login with new token

### "HTTP 403: Forbidden"

**Cause**: Bot lacks permissions or intents

**Solution**:
1. Enable "Message Content Intent" in Developer Portal
2. Ensure bot is member of the guild
3. Check bot has required permissions in channels

### Proxy works locally but not in production

**Cause**: Function not deployed or wrong configuration

**Solution**:
1. **Netlify**: Check `netlify.toml` has `functions = "netlify/functions"`
2. **Vercel**: Ensure `/api` folder exists in deployment
3. **Cloudflare**: Ensure `/functions` folder exists in deployment
4. Check build logs for errors

## Testing the Proxy

### Quick Test

1. Deploy your site
2. Open browser console
3. Try to login with your bot token
4. Check console for errors

### Manual Test (curl)

```bash
# Test Netlify proxy
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/users/@me",
    "method": "GET",
    "token": "YOUR_BOT_TOKEN"
  }'

# Test Vercel proxy
curl -X POST https://your-site.vercel.app/api/discord-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/users/@me",
    "method": "GET",
    "token": "YOUR_BOT_TOKEN"
  }'

# Test Cloudflare proxy
curl -X POST https://your-site.pages.dev/discord-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/users/@me",
    "method": "GET",
    "token": "YOUR_BOT_TOKEN"
  }'
```

Expected response:
```json
{
  "status": 200,
  "data": {
    "id": "...",
    "username": "YourBot",
    "discriminator": "0",
    ...
  },
  "ok": true
}
```

## File Structure

```
web/
├── netlify/
│   └── functions/
│       └── discord-proxy.js    # Netlify serverless function
├── api/
│   └── discord-proxy.js        # Vercel serverless function
├── functions/
│   └── discord-proxy.js        # Cloudflare Workers function
├── js/
│   └── discord-api.js          # Updated with proxy support
├── netlify.toml                # Netlify configuration
└── vercel.json                 # Vercel configuration
```

## Advanced: Custom Proxy Implementation

If you need to implement your own proxy:

### Requirements
- Accept POST requests with JSON body
- Forward to Discord API with proper headers
- Return response in expected format

### Request Format
```json
{
  "endpoint": "/users/@me",
  "method": "GET",
  "body": {},
  "token": "Bot ..."
}
```

### Response Format
```json
{
  "status": 200,
  "data": { ... },
  "ok": true
}
```

### Example (Node.js/Express)
```javascript
app.post('/discord-proxy', async (req, res) => {
  const { endpoint, method, body, token } = req.body;
  
  const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  const data = await response.json();
  
  res.json({
    status: response.status,
    data,
    ok: response.ok
  });
});
```

## Support

If you're still having issues:

1. Check [GitHub Issues](https://github.com/Star123451/DiscordBotClient/issues)
2. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific guides
3. Enable browser console and check for detailed error messages
4. Make sure you're using a supported deployment platform

## Summary

✅ **Netlify, Vercel, Cloudflare Pages**: Zero configuration needed, proxy works automatically  
⚠️ **GitHub Pages, Firebase, etc.**: Manual proxy setup required  
🔒 **Security**: Only use with test/development bots

The proxy is essential for the web version to work. Without it, you'll get CORS errors and the app won't function.
