# Discord Bot with Moderation & Logging System

## Project Overview
This is a feature-rich Discord bot system with two components:
1. **Main Bot** (`bot.js`) - Regular Discord bot with moderation, logging, and server management
2. **Selfbot Client** (`index.js`) - User account automation for advanced features

## Current Status
- Imported from GitHub and configured for Replit
- Database: SQLite for persistent storage
- Keep-alive server: Running on port 3000

## Architecture
### Main Bot Features
- Comprehensive logging system (commands, edits, deletes, moderation actions)
- Server statistics and analytics
- Moderation commands (kick, ban, mute, warn, purge, lock/unlock)
- Invite tracking with role rewards
- Auto-moderation (spam, links, @everyone)
- Heartbeat monitoring

### Selfbot Features
- Custom command prefix system
- Mass DM broadcast functionality
- User authorization system

## Configuration
### Required Environment Variables
- `BOT_TOKEN` - Discord bot token (required)
- `OWNER_ID` - Discord user ID for owner permissions (optional)
- `PASSCODE` - Security passcode for sensitive commands (optional)
- `HEARTBEAT_CHANNEL` - Channel name for heartbeat logs (default: "bot-logs")
- `HEARTBEAT_INTERVAL_MS` - Heartbeat interval in ms (default: 3 hours)
- `PORT` - Keep-alive server port (default: 3000)

### Database
- SQLite databases automatically created:
  - `database.sqlite` - Main bot data (guilds, settings, logs)
  - `selfbot_database.sqlite` - Selfbot data (prefixes)
  - `invite_counts.json` - Invite tracking persistence

## Recent Changes (Replit Setup)
- Fixed database path in index.js (was placeholder "path/to/database.sqlite")
- Configured workflow to run bot.js
- Added .gitignore for sensitive files
- Prepared for environment variable configuration

## Project Structure
```
/
├── bot.js                 # Main bot entry point
├── index.js              # Selfbot entry point
├── botCommands/          # Slash commands for main bot
├── Commands/             # Selfbot commands
└── *.md                  # Documentation files
```

## Passcode-Protected Commands
These commands require passcode `Bella@294` - **even owner cannot bypass**:
- `/massdm` - Mass DM all server members
- `/selfbot` - Trigger mass DM using user account token
- `/stopbroadcast` - Stop ongoing broadcast

## Deployment to Render
- **Web Service**: See `RENDER_WEB_SERVICE_DEPLOYMENT.md` for Web Service deployment
- **Background Worker**: See `RENDER_DEPLOYMENT.md` for Background Worker deployment

**Recommendation**: Web Service works but may sleep on free tier. Use UptimeRobot to keep it awake, or upgrade to Starter plan ($7/month).

## Recent Fixes
- ✅ Fixed `massdm` command to require passcode (was only checking owner role)
- ✅ Fixed directory error: Changed `./commands` to `./Commands` in index.js
- ✅ Hardcoded passcode fallback `Bella@294` in all three sensitive commands
- ✅ All passcode checks bypass owner permissions

## Next Steps
1. Set BOT_TOKEN in Replit Secrets ✅ DONE
2. Optional: Set OWNER_ID and PASSCODE
3. Start the bot workflow ✅ RUNNING
4. Invite bot to Discord server
5. Create #moderation-logs channel
6. Run `/setmodlog channel: #moderation-logs`
