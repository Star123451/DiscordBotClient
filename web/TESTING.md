# Testing the CORS Proxy Fix

This document describes how to test that the CORS proxy fix is working correctly.

## Quick Test on Deployed Site

1. **Deploy to Netlify, Vercel, or Cloudflare Pages**
   - Follow the deployment instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Wait for deployment to complete

2. **Test the Web App**
   - Visit your deployed URL
   - Open browser developer console (F12)
   - Paste your bot token and click "Login"
   - If successful, you should see:
     - Your bot's username and avatar in the UI
     - A list of guilds/servers on the left
     - No CORS errors in the console

3. **Expected Behavior**
   - ✅ Login succeeds without CORS errors
   - ✅ Guilds load and display
   - ✅ Clicking a guild loads channels
   - ✅ Clicking a channel loads messages
   - ✅ Sending messages works

4. **Before the Fix (for reference)**
   - ❌ CORS errors like: `Cross-Origin Request Blocked: The Same Origin Policy disallows...`
   - ❌ `Access-Control-Allow-Origin` missing errors
   - ❌ Status code 403 or NetworkError

## Testing Locally with Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Run Local Dev Server**
   ```bash
   cd web
   netlify dev
   ```

3. **Access the App**
   - Open http://localhost:8888 (or the port Netlify CLI shows)
   - Test login and features as described above

## Testing Proxy Endpoint Directly

You can test the proxy endpoint directly with curl:

### Netlify
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/discord-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/users/@me",
    "method": "GET",
    "token": "YOUR_BOT_TOKEN"
  }'
```

### Vercel
```bash
curl -X POST https://your-site.vercel.app/api/discord-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/users/@me",
    "method": "GET",
    "token": "YOUR_BOT_TOKEN"
  }'
```

### Cloudflare Pages
```bash
curl -X POST https://your-site.pages.dev/discord-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/users/@me",
    "method": "GET",
    "token": "YOUR_BOT_TOKEN"
  }'
```

### Expected Response
```json
{
  "status": 200,
  "data": {
    "id": "123456789",
    "username": "YourBot",
    "discriminator": "0",
    "avatar": "...",
    ...
  },
  "ok": true
}
```

## Verifying the Fix in Browser Console

1. Open browser console (F12)
2. After logging in, check the Network tab
3. Look for requests to the proxy endpoint:
   - Netlify: `/.netlify/functions/discord-proxy`
   - Vercel: `/api/discord-proxy`
   - Cloudflare: `/discord-proxy`
4. These should show status 200 (success)
5. No requests should be made directly to `discord.com/api/v10`

## Common Issues

### "Function not found" or 404

**Problem**: The proxy function isn't deployed

**Solution**:
- Check deployment logs
- Verify function files are in correct locations:
  - Netlify: `web/netlify/functions/discord-proxy.js`
  - Vercel: `web/api/discord-proxy.js`
  - Cloudflare: `web/functions/discord-proxy.js`
- Redeploy the site

### Still Getting CORS Errors

**Problem**: Proxy detection failed or proxy not working

**Solution**:
1. Check browser console for the proxy URL being used
2. Verify hostname detection is working
3. Try setting manual proxy URL:
   ```javascript
   window.DISCORD_PROXY_URL = '/.netlify/functions/discord-proxy';
   ```
4. Check if platform automatically deployed the function

### "Invalid token" or 401 Error

**Problem**: Bot token is incorrect

**Solution**:
- Verify token in Discord Developer Portal
- Copy entire token including "Bot" prefix if needed
- Regenerate token if it was exposed

## Automated Testing Checklist

- [ ] Deploy to Netlify - test login and guild loading
- [ ] Deploy to Vercel - test login and guild loading
- [ ] Deploy to Cloudflare Pages - test login and guild loading
- [ ] Test with Netlify CLI locally
- [ ] Test direct curl request to each proxy endpoint
- [ ] Verify no CORS errors in browser console
- [ ] Verify guild list loads correctly
- [ ] Verify channels load when selecting a guild
- [ ] Verify messages load when selecting a channel
- [ ] Verify sending a message works
- [ ] Verify no direct requests to discord.com/api/v10

## Security Testing

- [ ] Verify token is sent in POST body, not in URL
- [ ] Verify requests use HTTPS in production
- [ ] Verify proxy doesn't log tokens (check function logs)
- [ ] Verify wildcard CORS is documented in security warnings
- [ ] Test with test bot only (never production bot)

## Regression Testing

When making changes to the proxy or API client:

1. Run CodeQL security scan
2. Test all three proxy implementations
3. Test auto-detection on each platform
4. Verify error responses include CORS headers
5. Test with invalid tokens to verify error handling
6. Check that fallback to direct requests still works (will fail but shouldn't crash)

## Success Criteria

✅ All proxy endpoints return proper responses  
✅ No CORS errors in browser console  
✅ Login succeeds and guilds/channels load  
✅ Messages can be sent and received  
✅ CodeQL security scan passes  
✅ All error responses include CORS headers  
✅ Documentation is comprehensive and accurate  

## Notes

- The proxy is essential for the web version to work
- Without it, all Discord API calls will fail with CORS errors
- Each user should deploy their own instance with their own proxy
- The proxy should only be used with test/development bots
