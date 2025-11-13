# Combined Bot Setup Guide

This is now a **unified bot** that runs both a regular Discord bot and a selfbot from a single `bot.js` file.

## What Changed

- **One bot file** instead of two separate bots (`bot.js` now contains everything)
- **Both clients run simultaneously**:
  - Regular bot using `discord.js` v14 (handles invites, moderation, heartbeat, slash commands)
  - Selfbot using `discord.js-selfbot-v13` (handles prefix commands, mass DMs, authorization)
- **Shared database** for prefix management

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:
```
BOT_TOKEN=your_regular_bot_token_here
SELFBOT_TOKEN=your_selfbot_account_token_here
OWNER_ID=your_discord_id_here
HEARTBEAT_CHANNEL=bot-logs
HEARTBEAT_INTERVAL_MS=10800000
PORT=3000
```

### 3. Configure config.json

Update `config.json`:
```json
{
    "token": "your_selfbot_account_token_here",
    "successEmoji": "<:ThumbsUpCat:1191213939170758736>",
    "longstringoftext": "||​||||​||||​||||... [your invisible text here]"
}
```

## Features

### Regular Bot Features
- ✅ **Invite Tracking**: Tracks who invited users to your guild
- ✅ **Auto-Role**: Gives "Member" role after 3 invites
- ✅ **Anti-Alt**: Ignores accounts less than 3 days old
- ✅ **Moderation**:
  - Blocks @everyone mentions
  - Blocks link spam (Discord, YouTube, Spotify)
  - Anti-spam (5+ messages in 2 seconds)
- ✅ **Heartbeat Logging**: Sends status updates to #bot-logs
- ✅ **Slash Commands**: Load from `botCommands/` folder

### Selfbot Features
- ✅ **Prefix Commands**: Custom single-character prefix system
- ✅ **Authorization**: Add/remove authorized users (`!aa` and `!ra`)
- ✅ **Mass DM Broadcast**: Trigger with `/selfbot` slash command or via `selfbot_trigger.json`
- ✅ **Prefix Management**: `SetPrefix !` and `What's my prefix?`
- ✅ **Custom Commands**: Load from `Commands/` folder

## Running the Bot

```bash
node bot.js
```

Or use npm:
```bash
npm start
```

## Commands

### Selfbot Prefix Commands (default prefix is empty, set with "SetPrefix !")
- `SetPrefix !` - Set your command prefix (must be 1 special character)
- `What's my prefix?` - Get your current prefix
- `{prefix}aa @user` - Authorize a user
- `{prefix}ra @user` - Remove authorization from a user

### Regular Bot Slash Commands
- `/selfbot [usertoken] [serverid] [message]` - Broadcast mass DMs
- Check `botCommands/` folder for other commands

## File Structure

```
.
├── bot.js                      # MAIN FILE (unified bot)
├── config.json                 # Selfbot configuration
├── .env                        # Environment variables
├── package.json               # Dependencies
├── botCommands/               # Regular bot slash commands
│   ├── ping.js
│   ├── info.js
│   └── selfbot.js            # Triggers mass DM broadcast
├── Commands/                  # Selfbot prefix commands
│   ├── broadcast.js
│   ├── help.js
│   └── ...
├── database.sqlite           # SQLite database (auto-created)
├── invite_counts.json        # Invite tracking data
├── selfbot_trigger.json      # Trigger file for broadcasts
└── path/to/database.sqlite   # Database storage
```

## Important Notes

⚠️ **Security**:
- Never share your bot tokens or account tokens
- Keep `.env` and `config.json` out of version control
- The selfbot uses your personal account - use with caution

⚠️ **Discord ToS**:
- Selfbots may violate Discord's ToS
- Use at your own risk

## Troubleshooting

**Bot won't login:**
- Check `.env` file has correct tokens
- Verify `BOT_TOKEN` is from a regular bot application
- Verify selfbot token is from your personal account

**Commands not working:**
- Ensure commands are in correct folders
- Regular bot commands: `botCommands/` folder
- Selfbot commands: `Commands/` folder

**Database errors:**
- Delete `database.sqlite` to reset
- Check `path/to/database.sqlite` directory exists

**Selfbot not responding:**
- Make sure you've set a prefix with `SetPrefix !`
- Check selfbot account is logged in and online
