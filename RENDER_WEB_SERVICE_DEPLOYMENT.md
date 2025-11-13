# Deploy Discord Bot to Render (Web Service)

## Overview
Deploy your Discord bot as a **Web Service** on Render with HTTP health checks.

## Prerequisites
- GitHub repository: https://github.com/nihowsh/test1
- Render account (free tier available)
- Discord bot token (BOT_TOKEN)
- Passcode: `Bella@294`

## Step 1: Push Code to GitHub

Your code should already be at: https://github.com/nihowsh/test1

If not yet pushed, use Replit's Git integration or:
```bash
git init
git add .
git commit -m "Discord bot with moderation features"
git branch -M main
git remote add origin https://github.com/nihowsh/test1.git
git push -u origin main
```

## Step 2: Create Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect to GitHub repository: `nihowsh/test1`

## Step 3: Configure the Service

### Basic Settings
- **Name**: `discord-bot-luna`
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: (leave blank)
- **Build Command**: `npm install`
- **Start Command**: `node bot.js`

### Instance Type
- **Free** tier available (with limitations)
- **Starter** ($7/month) for better uptime

## Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value | Required |
|-----|-------|----------|
| `BOT_TOKEN` | Your Discord bot token | ✅ Yes |
| `PASSCODE` | `Bella@294` | ✅ Yes |
| `PORT` | `3000` | ✅ Yes |
| `OWNER_ID` | Your Discord user ID | ⚠️ Optional |
| `HEARTBEAT_CHANNEL` | `bot-logs` | ⚠️ Optional |
| `NODE_ENV` | `production` | ⚠️ Optional |

### Critical Settings for Web Service

Under **"Advanced"**:
- **Auto-Deploy**: Yes (automatically deploy on git push)
- **Health Check Path**: `/` (your Express server responds here)

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your GitHub repo
   - Run `npm install`
   - Execute `node bot.js`
   - Assign a public URL: `https://discord-bot-luna.onrender.com`

3. Monitor **Logs** tab for:
   ```
   Keep-alive server running on port 3000
   ✅ Bot logged in as Luna#6823
   ```

## Step 6: Verify

1. Your bot should show **Online** in Discord
2. Web service URL should respond: `https://your-app.onrender.com/` → "OK"
3. Test commands in Discord

## How Web Service Works for Discord Bot

Your bot has two components:
1. **Discord WebSocket connection** - Stays connected to Discord
2. **Express HTTP server** - Responds to Render health checks on port 3000

The Express server on port 3000 keeps the Web Service alive, while the Discord bot maintains its connection in the background.

## Free Tier Limitations ⚠️

Render's **Free Web Services**:
- ✅ Get a public URL
- ⚠️ **Spin down after 15 minutes** of inactivity
- ⚠️ Cold starts take 30+ seconds
- ⚠️ Limited to 750 hours/month

**Result**: Your bot may go offline during inactivity periods.

### Solutions:
1. **Upgrade to Starter** ($7/month) - No sleep, true 24/7
2. **Use UptimeRobot** - Free service to ping your URL every 5 minutes (keeps it awake)
3. **Use Background Worker** instead (better for Discord bots)

## Setting Up UptimeRobot (Free Keep-Alive)

If staying on free tier:

1. Go to [UptimeRobot](https://uptimerobot.com/)
2. Create free account
3. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: Your Render URL (e.g., `https://discord-bot-luna.onrender.com`)
   - **Interval**: 5 minutes
4. This pings your server every 5 minutes, preventing sleep

## Web Service URL

After deployment, Render gives you a URL like:
```
https://discord-bot-luna.onrender.com
```

You can visit this in browser to verify the keep-alive server is working (should show "OK").

## Auto-Deploy on Git Push

Once connected:
```bash
git add .
git commit -m "Update bot"
git push origin main
```
Render auto-deploys within 1-2 minutes.

## Troubleshooting

### Bot goes offline randomly
- **Free tier limitation** - Service spins down after 15 minutes idle
- **Solution**: Set up UptimeRobot or upgrade to Starter plan

### "Service Unavailable" errors
- Check logs for crashes
- Verify `PORT=3000` is set
- Ensure Express server is running

### Build fails
- Check Node.js version
- Verify `package.json` has all dependencies
- Review build logs

### Passcode not working
- Verify `PASSCODE=Bella@294` in environment variables
- Restart service after adding variables

## Environment Variables Reference

```
BOT_TOKEN=your_discord_bot_token_here
PASSCODE=Bella@294
PORT=3000
OWNER_ID=your_discord_user_id
HEARTBEAT_CHANNEL=bot-logs
HEARTBEAT_INTERVAL_MS=10800000
NODE_ENV=production
```

## Monitoring

Render Dashboard shows:
- **Service status** (Live/Offline)
- **Logs** (real-time)
- **Metrics** (CPU, memory)
- **Events** (deploys, restarts)

## Security

- Never commit `.env` or `config.json` to GitHub
- Use Render environment variables for all secrets
- Rotate BOT_TOKEN periodically
- Keep passcode private

## Commands Requiring Passcode

These commands need `Bella@294`:
- `/massdm passcode: Bella@294 message: Your message`
- `/selfbot passcode: Bella@294 usertoken: [token] serverid: [id] message: Hi`
- `/stopbroadcast passcode: Bella@294`

## Cost Comparison

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 750 hrs/month, spins down after 15min idle |
| Starter | $7/mo | Always on, no sleep, better performance |

## Support Resources

- [Render Web Services Docs](https://render.com/docs/web-services)
- [Discord.js Documentation](https://discord.js.org/)
- [UptimeRobot](https://uptimerobot.com/)

## Quick Checklist

- [ ] Code pushed to https://github.com/nihowsh/test1
- [ ] Web Service created on Render
- [ ] Environment variables added (BOT_TOKEN, PASSCODE, PORT)
- [ ] Service deployed successfully
- [ ] Bot shows online in Discord
- [ ] Health check URL responds "OK"
- [ ] UptimeRobot configured (if using free tier)
- [ ] Test passcode commands

Your bot is now deployed as a Web Service! 🎉

**Next**: Test with `/ping` or `/help` in your Discord server.
