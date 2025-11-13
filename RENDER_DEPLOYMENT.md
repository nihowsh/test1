# Deploy Discord Bot to Render

## Overview
This guide will help you deploy your Discord bot to Render as a **Background Worker** for 24/7 uptime.

## Prerequisites
- GitHub account
- Render account (free tier available at https://render.com)
- Your Discord bot token (BOT_TOKEN)
- Your passcode: `Bella@294`

## Step 1: Push Code to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial Discord bot setup"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

## Step 2: Create Background Worker on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Background Worker"** (⚠️ NOT Web Service!)
3. Connect your GitHub repository
4. Select the repository you just pushed

## Step 3: Configure the Service

### Build Settings
- **Name**: `discord-bot-luna` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose closest to your location
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node bot.js`

### Plan
- **Free** tier is available but has limitations
- **Starter** ($7/month) recommended for 24/7 uptime without sleep

## Step 4: Add Environment Variables

In the **Environment** section, add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `BOT_TOKEN` | Your Discord bot token | Get from Discord Developer Portal |
| `PASSCODE` | `Bella@294` | Required for massdm, selfbot, stopbroadcast |
| `OWNER_ID` | Your Discord user ID | Optional - for owner permissions |
| `HEARTBEAT_CHANNEL` | `bot-logs` | Optional - channel for heartbeat messages |
| `PORT` | `3000` | Optional - for keep-alive server |
| `NODE_ENV` | `production` | Recommended |

### How to Get BOT_TOKEN:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **Bot** section
4. Click **Reset Token** or **Copy**

### How to Get Your OWNER_ID:
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click your username
3. Click **Copy User ID**

## Step 5: Deploy

1. Click **"Create Background Worker"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Execute `node bot.js`
3. Monitor the **Logs** tab for:
   ```
   Keep-alive server running on port 3000
   ✅ Bot logged in as Luna#6823
   ```

## Step 6: Verify Bot is Online

1. Check your Discord server
2. Bot should show as online
3. Test a command like `/ping` or `/help`

## Important Notes

### ⚠️ Background Worker vs Web Service
- **Use Background Worker** - Discord bots need persistent WebSocket connections
- **DO NOT use Web Service** - Web services expect HTTP requests and timeout

### Free Tier Limitations
Render's free tier has these limitations:
- Services **spin down after 15 minutes** of inactivity
- Free services **sleep after some time**
- Not ideal for 24/7 Discord bots

**Recommendation**: Upgrade to Starter plan ($7/month) for true 24/7 uptime

### Alternative Free Hosting
If you need free 24/7 hosting:
- **Railway** (limited free tier)
- **DigitalOcean App Platform** ($5/month with $200 free credit for new users)
- **Oracle Cloud** (always free tier - 2 ARM-based Compute VMs)
- **AWS EC2** (free tier for 12 months)

## Auto-Deploy on Push

Once connected to GitHub, Render automatically redeploys when you push updates:

```bash
git add .
git commit -m "Update bot features"
git push origin main
```

Render detects the push and redeploys within 1-2 minutes.

## Troubleshooting

### Bot shows offline
- Check Render logs for errors
- Verify `BOT_TOKEN` is correct
- Ensure required Discord intents are enabled in Developer Portal

### Build fails
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs for missing packages

### Directory errors
- Fixed: Changed `./commands` to `./Commands` (capital C)
- Ensure all file paths match exact capitalization

### Passcode commands not working
- Verify `PASSCODE` environment variable is set to `Bella@294`
- Test commands: `/massdm`, `/selfbot`, `/stopbroadcast` all require passcode

### Node modules missing
- Ensure `npm install` runs in Build Command
- Check that `package.json` and `package-lock.json` are committed to Git

## Security Best Practices

1. **Never commit secrets to Git**
   - `.env` file is in `.gitignore`
   - Use Render's environment variables
   
2. **Rotate tokens regularly**
   - Change BOT_TOKEN periodically
   - Update in Render environment variables

3. **Protect passcode**
   - Only share passcode with trusted users
   - Passcode protects mass DM and selfbot features

## Commands Requiring Passcode

These commands require passcode `Bella@294` - **even owner cannot bypass**:

1. `/massdm` - Mass DM all server members
2. `/selfbot` - Trigger mass DM using user account token
3. `/stopbroadcast` - Stop ongoing broadcast

Example usage:
```
/massdm passcode: Bella@294 message: Hello everyone!
/selfbot passcode: Bella@294 usertoken: [token] serverid: [id] message: Hi!
/stopbroadcast passcode: Bella@294
```

## Support Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Render Documentation](https://render.com/docs)
- [Render Background Workers Guide](https://render.com/docs/background-workers)
- [Discord Developer Portal](https://discord.com/developers/applications)

## Files Checklist Before Deployment

Make sure these are in your repository:
- ✅ `package.json` (with all dependencies)
- ✅ `package-lock.json` (ensures consistent installs)
- ✅ `bot.js` (main entry point)
- ✅ `index.js` (selfbot entry point)
- ✅ `botCommands/` folder (all slash commands)
- ✅ `Commands/` folder (selfbot commands)
- ✅ `.gitignore` (excluding node_modules, .env, etc.)
- ⚠️ **DO NOT include**: `.env`, `config.json`, `database.sqlite`

## Post-Deployment

After successful deployment:

1. **Invite bot to server** (if not already)
2. **Create `#moderation-logs` channel**
3. **Run** `/setmodlog channel: #moderation-logs`
4. **Test commands** to verify everything works
5. **Monitor logs** in Render dashboard

Your bot is now deployed and running 24/7! 🎉
