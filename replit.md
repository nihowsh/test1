# Discord Bot with Moderation & Logging System

## Project Overview
This is a feature-rich Discord bot (bot.js) with integrated selfbot functionality for mass DM features. The selfbot is triggered via the `/selfbot` command and runs within the same bot process.

## Current Status
- Imported from GitHub and configured for Replit
- Database: SQLite for persistent storage
- Keep-alive server: Running on port 3000

## Bot Features
- **Moderation (31 commands)**: kick, ban, mute, warn, purge, lock/unlock, lockdown/unlockdown, slowmode, nickname, addrole, removerole, nuke channel, view warnings, clear warnings
- **Logging**: Commands, message edits/deletes, moderation actions
- **Server Stats**: Analytics and member tracking
- **Invite Tracking**: Auto-role rewards based on invite count
- **Auto-moderation**: Spam detection, link blocking, @everyone protection
- **Selfbot Integration**: Mass DM via `/selfbot` command with progress reports to channel
- **Broadcast Control**: `/stopbroadcast` to halt ongoing mass DM
- **Server Cloning**: Save/load server templates with roles, channels, permissions (using unique codes)
- **Video Downloader**: Download videos from YouTube, TikTok, Instagram, Redgifs, Snapchat (up to 10 at once) with auto-compression
- **Heartbeat Monitoring**: Periodic status updates

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
  - `database.sqlite` - Main bot data (guilds, settings, logs, warnings, server templates)
  - `selfbot_database.sqlite` - Selfbot data (prefixes)
  - `invite_counts.json` - Invite tracking persistence
- Shared database module (`database.js`) for consistent data persistence

## Recent Changes
### November 2025 - Major Feature Update
- ✅ Added 8 new moderation commands (lockdown, unlockdown, nickname, warnings, clearwarns, addrole, removerole, nuke)
- ✅ Implemented server cloning system with `/saveclone` and `/loadclone` commands
- ✅ Added video downloader (`/downloadvideo`) supporting multiple platforms with auto-compression
- ✅ Fixed selfbot progress reports to send to command channel instead of DMs
- ✅ Fixed serverstats command error with channel type checking
- ✅ Created shared database module for consistent data persistence
- ✅ Fixed warnings system to properly save/retrieve warnings
- ✅ Secured video downloader against command injection vulnerabilities
- ✅ Fixed server cloning to properly restore role-based permissions
- ✅ Installed yt-dlp and ffmpeg for video downloading

## Project Structure
```
/
├── bot.js                # Main bot (runs everything)
├── database.js          # Shared database module (Sequelize)
├── index.js             # Legacy selfbot code (not used)
├── botCommands/         # 31 slash commands (discord.js v14)
│   ├── Moderation: ban, kick, mute, unmute, warn, warnings, clearwarns, 
│   │   purge, lock, unlock, lockdown, unlockdown, slowmode, nuke, 
│   │   nickname, addrole, removerole, checkbans, unban
│   ├── Server Management: saveclone, loadclone, serverstats, setmodlog, 
│   │   modrules, automod
│   ├── Features: selfbot, massdm, stopbroadcast, downloadvideo
│   └── Invite System: manageinviteroles, setinvitethreshold
├── Commands/            # Legacy commands (not used)
└── *.md                 # Documentation files
```

**Note**: Only bot.js runs. The selfbot functionality is built into bot.js and triggered by the `/selfbot` command.

## Passcode-Protected Commands
These commands require passcode `Bella@294` - **even owner cannot bypass**:
- `/massdm` - Mass DM all server members
- `/selfbot` - Trigger mass DM using user account token
- `/stopbroadcast` - Stop ongoing broadcast

## Deployment to Render
- **Web Service**: See `RENDER_WEB_SERVICE_DEPLOYMENT.md` for Web Service deployment
- **Background Worker**: See `RENDER_DEPLOYMENT.md` for Background Worker deployment

**Recommendation**: Web Service works but may sleep on free tier. Use UptimeRobot to keep it awake, or upgrade to Starter plan ($7/month).

## All Available Commands (31 Total)

### Moderation (19 commands)
- `/ban`, `/kick`, `/mute`, `/unmute`, `/unban` - Basic moderation
- `/warn`, `/warnings`, `/clearwarns` - Warning system with database
- `/purge` - Bulk delete messages
- `/lock`, `/unlock` - Lock/unlock single channel
- `/lockdown`, `/unlockdown` - Lock/unlock entire server
- `/slowmode` - Set channel slowmode
- `/nuke` - Delete and recreate channel
- `/nickname` - Change user nickname
- `/addrole`, `/removerole` - Manage user roles
- `/checkbans` - View server bans

### Server Management (6 commands)
- `/saveclone` - Save server template with code (roles, channels, permissions)
- `/loadclone` - Load and apply server template
- `/serverstats` - Detailed server analytics
- `/setmodlog` - Configure moderation logging
- `/modrules` - Set server rules
- `/automod` - Configure auto-moderation

### Special Features (4 commands)
- `/selfbot` - Mass DM with progress reports (passcode protected)
- `/massdm` - Alternative mass DM (passcode protected)
- `/stopbroadcast` - Stop ongoing broadcast
- `/downloadvideo` - Download videos from YouTube/TikTok/Instagram/Redgifs (up to 10 at once)

### Invite System (2 commands)
- `/manageinviteroles` - Manage invite reward roles
- `/setinvitethreshold` - Set invite thresholds

## Next Steps
1. Set BOT_TOKEN in Replit Secrets ✅ DONE
2. Optional: Set OWNER_ID and PASSCODE
3. Start the bot workflow ✅ RUNNING
4. Invite bot to Discord server
5. Create #moderation-logs channel
6. Run `/setmodlog channel: #moderation-logs`
