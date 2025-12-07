# 🌐 Discord Bot Client - Web Version

This repository now includes a **static web-based version** of Discord Bot Client that can be deployed to any static hosting service!

## Quick Links

- 📁 **Web Version Files**: [`/web`](./web) directory
- 📖 **Full Documentation**: [`/web/README.md`](./web/README.md)
- 🖥️ **Desktop Version**: Original Electron app (still available in root)

## What's New?

The web version is a **complete rewrite** that:
- ✅ Runs entirely in the browser (no installation)
- ✅ Deployable to GitHub Pages, Netlify, Vercel, etc.
- ✅ Zero dependencies, pure vanilla JavaScript
- ✅ No build process required
- ✅ Real-time Discord Gateway connection
- ✅ Send and receive messages
- ✅ Browse guilds and channels

## Quick Deploy

### Deploy to Netlify (1 click)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Star123451/DiscordBotClient)

### Deploy to Vercel (1 click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Star123451/DiscordBotClient)

### Deploy to GitHub Pages
1. Go to repository **Settings** > **Pages**
2. Set source to **main branch** and **`/web`** folder
3. Click **Save**
4. Wait 1-2 minutes and visit your GitHub Pages URL

### Local Testing
```bash
cd web
python -m http.server 8000
# Visit http://localhost:8000
```

## Feature Comparison

| Feature | Desktop (Electron) | Web (Static) |
|---------|-------------------|--------------|
| Installation Required | ✅ Yes | ❌ No |
| Works Offline | ✅ Yes | ❌ No |
| File Upload | ✅ Yes | ❌ No |
| Voice/Video | ⚠️ Limited | ❌ No |
| Token Security | ✅ Better | ⚠️ Less Secure |
| Auto-Updates | ✅ Yes | ✅ Always Latest |
| Cross-Platform | ✅ Yes | ✅ Yes |
| Mobile Support | ❌ No | ✅ Yes |
| Deploy Anywhere | ❌ No | ✅ Yes |
| View Messages | ✅ Yes | ✅ Yes |
| Send Messages | ✅ Yes | ✅ Yes |
| Real-time Updates | ✅ Yes | ✅ Yes |

## Which Version Should I Use?

### Use the **Desktop Version** if you need:
- Maximum security for bot tokens
- File upload capabilities
- Voice channel support
- Offline access
- Full Discord feature parity

### Use the **Web Version** if you need:
- No installation required
- Easy deployment and sharing
- Access from any device
- Quick testing/development
- Mobile browser access

## Security Note ⚠️

The web version stores bot tokens in browser localStorage. Only use it with:
- Test/development bots
- Personal bots you control
- Bots without admin permissions

**Never use it with production bots or bots with sensitive permissions.**

## Getting Started with Web Version

1. **Get a Bot Token**
   - Visit [Discord Developer Portal](https://discord.com/developers/applications)
   - Create an application or select existing one
   - Go to "Bot" section
   - Copy the bot token
   - Enable "Message Content Intent"

2. **Open the Web App**
   - Deploy using one of the methods above, or
   - Open `web/index.html` locally

3. **Login**
   - Paste your bot token
   - Click "Login"
   - Start using!

## Directory Structure

```
DiscordBotClient/
├── web/                    # 🌐 NEW: Static web version
│   ├── index.html         # Main HTML file
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── README.md          # Detailed web docs
│   ├── netlify.toml       # Netlify config
│   ├── vercel.json        # Vercel config
│   └── _headers           # Cloudflare config
├── src/                    # Desktop Electron source
├── assets/                 # Desktop assets
├── build/                  # Desktop compiled files
└── ... (other desktop files)
```

## Contributing

Both versions are maintained in this repository:
- Desktop version: Root directory
- Web version: `/web` directory

Contributions to either version are welcome!

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/Star123451/DiscordBotClient/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Star123451/DiscordBotClient/discussions)
- 📖 **Documentation**: See `/web/README.md` for web version details

## License

GPL-3.0 License - Same as original project

Both desktop and web versions are open source and free to use.
