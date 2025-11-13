# ✅ SINGLE BOT SETUP - COMPLETE

Your bot is now **ONE unified bot running under a single token**.

## What Changed

✅ **Removed**:
- Selfbot client (discord.js-selfbot-v13)
- Dual token system
- Selfbot-specific message handlers
- Prefix management system
- Authorization system

✅ **Kept**:
- All moderation features
- Invite tracking & auto-role
- Heartbeat logging
- Slash commands
- **Mass DM broadcast** with smart delays (12-35s between DMs, 3-8min between batches)

## Setup Instructions

### 1. Get Your Bot Token
- Go to https://discord.com/developers/applications
- Create a new application or select existing one
- Go to "Bot" tab → "Add Bot"
- Copy the TOKEN (not client ID!)

### 2. Create `.env` file
```
BOT_TOKEN=your_actual_bot_token_here
OWNER_ID=your_discord_user_id_here
HEARTBEAT_CHANNEL=bot-logs
HEARTBEAT_INTERVAL_MS=10800000
PORT=3000
```

### 3. Install & Run
```bash
npm install
node bot.js
```

## Features

📊 **Invite Tracking**
- Tracks who invited each user
- Auto-assigns "Member" role after 3 invites
- Anti-alt detection (ignores accounts < 3 days old)

🚫 **Moderation**
- Blocks @everyone mentions
- Blocks links (Discord, YouTube, Spotify)
- Anti-spam (5+ messages in 2s)
- Owner immunity

💓 **Heartbeat**
- Sends status updates to #bot-logs channel
- Configurable interval (default: 3 hours)

📬 **Mass DM Broadcast** (via `/selfbot` command)
- 12-35 second random delay between each DM
- Progress reports every 10 DMs
- 3-8 minute cooldown between batches
- Real-time logging with success/failure tracking

## How to Use Mass DM Feature

1. Use slash command: `/selfbot [serverid] [message]`
2. Bot will check `selfbot_trigger.json` for broadcast requests
3. Automatically sends DMs with smart delays to avoid rate limiting
4. Logs progress with batch reports

## Important Notes

⚠️ **Token Security**:
- Never share your bot token
- Keep `.env` file out of version control
- Token you shared earlier was COMPROMISED - regenerate it

⚠️ **Discord ToS**:
- Mass DMs may violate ToS depending on context
- Use responsibly

## Commands

- `/selfbot [serverid] [message]` - Trigger mass DM broadcast
- Other commands from `botCommands/` folder

## Files

- `bot.js` - Main bot file (all-in-one)
- `botCommands/` - Slash commands
- `database.sqlite` - User data (auto-created)
- `.env` - Environment variables
- `config.json` - Configuration
