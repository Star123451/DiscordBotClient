# Discord Bot Client - Web Edition

A **static web-based** Discord bot client that runs entirely in your browser. No server required, no installation needed - just open and connect with your bot token.

⚠️ **SECURITY WARNING**: This web version exposes your bot token in the browser. Only use it for testing, development, or personal bots you fully control. Never use it with production bots or share the page while logged in.

## Features

✅ **Fully Static** - No backend server required, deployable on any static host  
✅ **Real-time Gateway Connection** - WebSocket connection to Discord Gateway  
✅ **Guild & Channel Navigation** - Browse all your bot's guilds and channels  
✅ **Message Viewing** - View message history with attachments and embeds  
✅ **Send Messages** - Send text messages to any channel  
✅ **Real-time Updates** - Receive new messages in real-time via Gateway  
✅ **User Settings** - Dark/light mode, compact mode, message limits  
✅ **No Dependencies** - Pure vanilla JavaScript, no build process  
✅ **Responsive Design** - Works on desktop and mobile browsers  
✅ **Local Storage** - Saves token and preferences locally  

## Deployment Options

### Option 1: GitHub Pages (Recommended)

1. Fork or clone this repository
2. Go to repository Settings > Pages
3. Set source to main branch and `/web` folder (or root if you moved files)
4. Save and wait for deployment
5. Visit your GitHub Pages URL

### Option 2: Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop the `web` folder to Netlify
3. Your site is live instantly!

### Option 3: Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Import your repository
3. Set the root directory to `web`
4. Deploy

### Option 4: Cloudflare Pages

1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Set build output directory to `web`
4. Deploy

### Option 5: Local Development

Simply open `index.html` in your browser:

```bash
cd web
python -m http.server 8000
# Or use any other local server
```

Then visit `http://localhost:8000`

## How to Use

1. **Get Your Bot Token**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your bot application
   - Go to "Bot" section
   - Copy your bot token
   - **Important**: Enable "Message Content Intent" for full functionality

2. **Login**
   - Open the web application
   - Paste your bot token in the login field
   - Click "Login"

3. **Navigate**
   - Click guild icons on the left to view guilds
   - Click channels to view messages
   - Type and send messages in the input box

4. **Settings**
   - Click the gear icon in the bottom left
   - Adjust appearance and message settings
   - Settings are saved locally

## Features Included

### ✅ Working Features
- Bot token authentication
- Discord Gateway WebSocket connection
- View all guilds your bot is in
- Browse guild channels (text channels)
- View message history (configurable limit)
- Send text messages
- Real-time message updates
- User info display
- Guild/channel navigation
- Message timestamps
- User avatars
- Guild icons
- Message attachments (display)
- Message embeds (display)
- Dark/Light mode
- Compact message mode
- Settings persistence
- Connection status indicator

### ❌ Limitations (Due to Static/Browser Nature)
- No voice/video support (requires backend)
- No file uploads (CORS limitations)
- No DM support (requires special handling)
- Token stored in localStorage (less secure than desktop)
- Rate limiting not implemented client-side
- No slash commands UI (API only)
- No rich presence/status for bot
- Limited to public bot endpoints

## File Structure

```
web/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application logic
│   ├── discord-api.js  # Discord REST API client
│   ├── gateway.js      # Discord Gateway WebSocket client
│   └── ui.js           # UI controller and rendering
└── README.md           # This file
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Opera 76+

Requires:
- WebSocket support
- ES6+ JavaScript
- LocalStorage
- Fetch API

## Security Considerations

⚠️ **IMPORTANT SECURITY NOTES**:

1. **Token Exposure**: Your bot token is stored in browser localStorage and sent with every API request. This makes it vulnerable to:
   - XSS attacks if the page is compromised
   - Browser extensions with access to page data
   - Physical access to the computer

2. **Best Practices**:
   - Only use with test/development bots
   - Never use with bots that have admin permissions
   - Don't use on shared/public computers
   - Clear browser data after use
   - Use the logout button to clear token
   - Consider it compromised if used on untrusted networks

3. **Alternatives for Production**:
   - Use the desktop Electron version instead
   - Host your own backend with proper token management
   - Use Discord's official bot hosting solutions

## Troubleshooting

### "Failed to connect to Gateway"
- Check your internet connection
- Verify your bot token is correct
- Ensure bot is not disabled in Developer Portal

### "Failed to load messages"
- Check if bot has permission to read messages in that channel
- Verify "Message Content Intent" is enabled
- Check browser console for specific errors

### "This token is not a bot token"
- Make sure you're using a BOT token, not a user token
- Get the token from Discord Developer Portal > Your App > Bot section

### Messages not updating
- Check connection status indicator (top right)
- Try refreshing the page
- Verify Gateway connection in browser console

### Can't send messages
- Ensure bot has "Send Messages" permission in that channel
- Check if channel is read-only
- Verify bot is not rate-limited

## Discord API Version

This client uses Discord API v10 and Gateway v10.

## Intents Used

- `GUILDS` (1 << 0) - Required for guild/channel info
- `GUILD_MESSAGES` (1 << 9) - Required for reading messages
- `MESSAGE_CONTENT` (1 << 15) - Required for message content

**Note**: You must enable "Message Content Intent" in Discord Developer Portal for full functionality.

## Development

To modify or extend the web client:

1. All code is vanilla JavaScript - no build process needed
2. Edit files directly and refresh browser
3. Check browser console for errors
4. Use browser DevTools for debugging

### Adding Features

- **discord-api.js**: Add new API endpoints
- **gateway.js**: Add new Gateway event handlers
- **ui.js**: Add new UI components
- **app.js**: Wire up new features
- **styles.css**: Add new styles

## Credits

Based on the original [DiscordBotClient](https://github.com/aiko-chan-ai/DiscordBotClient) Electron application.

Converted to static web version for easy deployment and accessibility.

## License

GPL-3.0 License - Same as original project

## Disclaimer

Discord is a trademark of Discord Inc. This is an unofficial client. Use at your own risk. Bot automation must comply with Discord's Terms of Service and API guidelines.
