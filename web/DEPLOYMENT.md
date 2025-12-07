# 🚀 Deployment Guide - Discord Bot Client Web

Step-by-step guide to deploy the Discord Bot Client web version to various static hosting platforms.

## 📸 Preview

![Login Screen](https://github.com/user-attachments/assets/837ddbb2-93f1-4757-8a73-c8a6d0cce4fa)

## Prerequisites

- A Discord bot token ([Get one here](https://discord.com/developers/applications))
- Message Content Intent enabled for your bot
- A GitHub account (for most deployment options)

## ⚠️ Important: CORS Proxy Requirement

The web version **requires a serverless proxy** to communicate with Discord's API due to CORS restrictions. 

**✅ Platforms with built-in proxy support (recommended):**
- Netlify (automatic)
- Vercel (automatic)
- Cloudflare Pages (automatic)

**⚠️ Platforms requiring manual proxy setup:**
- GitHub Pages (needs external proxy)
- Firebase Hosting (needs external proxy)
- Other static hosts (needs external proxy)

For detailed proxy setup, see [PROXY_SETUP.md](./PROXY_SETUP.md).

## Deployment Options

### 🟢 Option 1: GitHub Pages (Free, Easy)

**Best for**: Public projects, documentation, free hosting

⚠️ **Note**: GitHub Pages doesn't support serverless functions. You'll need to deploy the proxy separately on Netlify/Vercel/Cloudflare (free) or use one of those platforms instead. See [PROXY_SETUP.md](./PROXY_SETUP.md) for details.

1. **Fork or Clone this Repository**
   ```bash
   git clone https://github.com/Star123451/DiscordBotClient.git
   cd DiscordBotClient
   ```

2. **Push to Your GitHub**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/DiscordBotClient.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** > **Pages**
   - Under "Source", select **main** branch
   - Select **`/web`** folder
   - Click **Save**

4. **Setup External Proxy** (Required)
   - See [PROXY_SETUP.md](./PROXY_SETUP.md) for instructions
   - You can deploy just the proxy to Netlify/Vercel for free

5. **Access Your Site**
   - Wait 1-2 minutes for deployment
   - Visit: `https://YOUR_USERNAME.github.io/DiscordBotClient/`

**Custom Domain (Optional)**:
- Add a `CNAME` file in `/web` directory with your domain
- Configure DNS with a CNAME record pointing to `YOUR_USERNAME.github.io`

**Recommendation**: Use Netlify or Vercel instead for zero-config proxy support.

---

### 🔷 Option 2: Netlify (Free, Fastest) ✅ Recommended

**Best for**: Quick deployments, CI/CD, zero-config proxy

✅ **Built-in proxy support** - No additional setup needed!

#### Method A: Drag & Drop (Easiest)

1. Visit [Netlify Drop](https://app.netlify.com/drop)
2. Drag the `/web` folder to the upload area
3. Your site is live instantly with working proxy!
4. Get a URL like: `https://random-name-12345.netlify.app`

#### Method B: Git Integration (Recommended)

1. Sign up at [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Connect your GitHub account
4. Select your repository
5. Configure:
   - **Base directory**: `web`
   - **Build command**: (leave empty)
   - **Publish directory**: `.` (current directory)
6. Click **Deploy site**
7. Get a URL like: `https://random-name-12345.netlify.app`

The proxy function (`/.netlify/functions/discord-proxy`) is automatically deployed!

**Custom Domain**:
- Go to Site settings > Domain management
- Add custom domain and follow DNS instructions

---

### ⚫ Option 3: Vercel (Free, Fast) ✅ Recommended

**Best for**: Next.js projects, edge functions, serverless

✅ **Built-in proxy support** - No additional setup needed!

1. Visit [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `web`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
5. Click **Deploy**
6. Get a URL like: `https://discord-bot-client.vercel.app`

The proxy function (`/api/discord-proxy`) is automatically deployed!

**Custom Domain**:
- Go to Project settings > Domains
- Add your domain and configure DNS

---

### 🟠 Option 4: Cloudflare Pages (Free, Global CDN) ✅ Recommended

**Best for**: Global distribution, DDoS protection, edge workers

✅ **Built-in proxy support** - No additional setup needed!

1. Visit [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click **"Create a project"**
3. Connect your GitHub account
4. Select your repository
5. Configure:
   - **Production branch**: `main`
   - **Build command**: (leave empty)
   - **Build output directory**: `web`
6. Click **Save and Deploy**
7. Get a URL like: `https://discord-bot-client.pages.dev`

The proxy function (`/discord-proxy`) is automatically deployed!

**Custom Domain**:
- Go to Custom domains
- Add your domain (DNS configured automatically if using Cloudflare)

---

### 🟣 Option 5: GitLab Pages (Free)

**Best for**: Private repositories, CI/CD pipelines

1. Create `.gitlab-ci.yml` in repository root:
   ```yaml
   pages:
     stage: deploy
     script:
       - mkdir .public
       - cp -r web/* .public/
       - mv .public public
     artifacts:
       paths:
         - public
     only:
       - main
   ```

2. Push to GitLab
3. Visit: `https://YOUR_USERNAME.gitlab.io/DiscordBotClient/`

---

### 🔴 Option 6: Render (Free)

**Best for**: Full-stack apps, databases, cron jobs

1. Visit [render.com](https://render.com)
2. Click **"New Static Site"**
3. Connect your repository
4. Configure:
   - **Build Command**: (leave empty)
   - **Publish Directory**: `web`
5. Click **Create Static Site**
6. Get a URL like: `https://discord-bot-client.onrender.com`

---

### 🟡 Option 7: Firebase Hosting (Free)

**Best for**: Google Cloud integration, Firebase features

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Configure:
   - Public directory: `web`
   - Single-page app: `No`
   - GitHub integration: (optional)

4. Deploy:
   ```bash
   firebase deploy
   ```

5. Get a URL like: `https://your-project.web.app`

---

### 🌐 Option 8: Surge (Free, Simple)

**Best for**: Quick prototypes, simple static sites

1. Install Surge:
   ```bash
   npm install -g surge
   ```

2. Deploy:
   ```bash
   cd web
   surge
   ```

3. Follow prompts to get a URL like: `https://discord-bot-client.surge.sh`

---

### 💻 Option 9: Local Server (Development)

**For testing only, not for production**

#### Python (Built-in):
```bash
cd web
python3 -m http.server 8080
# Visit http://localhost:8080
```

#### Node.js (with http-server):
```bash
npm install -g http-server
cd web
http-server -p 8080
# Visit http://localhost:8080
```

#### PHP (Built-in):
```bash
cd web
php -S localhost:8080
# Visit http://localhost:8080
```

---

## Post-Deployment Setup

### 1. Configure Your Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application
3. Go to **Bot** section
4. Enable **"Message Content Intent"**
5. Copy your bot token

### 2. Add Bot to Server

1. Go to **OAuth2** > **URL Generator**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands` (optional)
3. Select bot permissions:
   - ✅ `Read Messages/View Channels`
   - ✅ `Send Messages`
   - ✅ `Read Message History`
   - ✅ `Add Reactions` (optional)
4. Copy the generated URL and open it
5. Select your server and authorize

### 3. Login to Web Client

1. Visit your deployed URL
2. Paste your bot token
3. Click **Login**
4. Start using!

---

## Security Best Practices

⚠️ **Important**: The web version stores tokens in browser localStorage

### DO:
- ✅ Use only with test/development bots
- ✅ Use bots without admin permissions
- ✅ Clear browser data after use
- ✅ Use HTTPS (most hosts provide this automatically)
- ✅ Logout when done (clears token)

### DON'T:
- ❌ Use with production bots
- ❌ Use on shared/public computers
- ❌ Use bots with server admin permissions
- ❌ Share your deployed URL with token logged in
- ❌ Use on untrusted networks

---

## Troubleshooting

### Deployment Issues

**"404 Not Found"**
- Check that build output directory is correct
- Verify all files are in the web directory
- Clear deployment cache and redeploy

**"403 Forbidden"**
- Check repository permissions
- Verify GitHub Pages is enabled
- Check if custom domain DNS is configured correctly

**"White screen / Blank page"**
- Check browser console for errors
- Verify all files were deployed
- Check Content-Type headers

### Login Issues

**"This token is not a bot token"**
- Make sure you're using a BOT token from Discord Developer Portal
- User tokens will not work

**"Failed to connect to Gateway"**
- Check your internet connection
- Verify bot token is correct
- Check if bot is disabled in Developer Portal

**"Failed to load messages"**
- Enable "Message Content Intent" in Developer Portal
- Check bot permissions in the channel
- Verify bot is a member of the server

### Performance Issues

**Slow loading**
- Check your internet connection
- Try reducing message limit in settings
- Clear browser cache

**Messages not updating**
- Check connection status (top right)
- Refresh the page
- Check browser console for Gateway errors

---

## Advanced Configuration

### Custom Headers (Security)

Most hosting platforms support custom headers via configuration files (already included):

- `netlify.toml` - Netlify configuration
- `vercel.json` - Vercel configuration
- `_headers` - Cloudflare Pages configuration

These files include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`

### Environment Variables

For enhanced security, you could modify the code to accept token via URL parameter:

```javascript
// In app.js, modify init() method
const urlParams = new URLSearchParams(window.location.search);
const tokenParam = urlParams.get('token');
if (tokenParam) {
    await this.login(tokenParam, true);
}
```

Then visit: `https://your-site.com/?token=YOUR_BOT_TOKEN`

⚠️ **Note**: This exposes token in URL history. Use with caution.

---

## Monitoring & Analytics

### Add Google Analytics

1. Get tracking ID from [analytics.google.com](https://analytics.google.com)
2. Add to `index.html` in `<head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Add Plausible (Privacy-friendly)

1. Sign up at [plausible.io](https://plausible.io)
2. Add to `index.html` in `<head>`:

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## Updating Your Deployment

### GitHub Pages / Netlify / Vercel (Git-based)

1. Make changes to files in `/web` directory
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update web client"
   git push
   ```
3. Deployment happens automatically (wait 1-2 minutes)

### Manual Deployments (Netlify Drop, Surge)

1. Make changes to files
2. Re-deploy using the same method
3. For Netlify Drop: drag and drop again
4. For Surge: run `surge` again in the directory

---

## Support

- 📖 **Documentation**: [README.md](./README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Star123451/DiscordBotClient/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Star123451/DiscordBotClient/discussions)

---

## Cost Comparison

| Platform | Free Tier | Bandwidth | Build Minutes | Custom Domain |
|----------|-----------|-----------|---------------|---------------|
| GitHub Pages | Yes | 100GB/month | N/A | Yes |
| Netlify | Yes | 100GB/month | 300 min/month | Yes |
| Vercel | Yes | 100GB/month | 6000 min/month | Yes |
| Cloudflare Pages | Yes | Unlimited | 500 builds/month | Yes |
| Render | Yes | 100GB/month | 400 min/month | Yes |
| Firebase | Yes | 10GB/month | N/A | Yes |
| Surge | Yes | Unlimited | N/A | Yes (paid) |

All are sufficient for personal use! Choose based on your preferences.

---

Happy Deploying! 🚀
