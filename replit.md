# Discord Bot with Moderation & Logging System

## Project Overview
This is a feature-rich Discord bot (bot.js) with integrated selfbot functionality for mass DM features. The selfbot is triggered via the `/selfbot` command and runs within the same bot process.

## Current Status
- ✅ Successfully migrated to Replit environment (November 14, 2025)
- ✅ All packages installed and configured
- ✅ Workflow configured and running
- Database: SQLite for persistent storage
- Keep-alive server: Running on port 3000
- **Next**: Add BOT_TOKEN to environment secrets to activate the bot

## Bot Features
- **Moderation (33 commands)**: kick, ban, mute, warn, purge, lock/unlock, lockdown/unlockdown, slowmode, nickname, addrole, removerole, nuke channel, view warnings, clear warnings
- **Logging**: Commands, message edits/deletes, moderation actions
- **Server Stats**: Analytics and member tracking
- **Invite Tracking**: Auto-role rewards based on invite count
- **Auto-moderation**: Advanced spam detection with duplicate messages, emoji spam, caps lock filter, mention spam, anti-raid protection
- **Attachment Rules**: Enforce phrase requirements for attachments in specific channels
- **Scheduled Mentions**: Auto-post @everyone at configured intervals with instant deletion
- **Selfbot Integration**: Mass DM via `/selfbot` command with progress reports to channel
- **Broadcast Control**: `/stopbroadcast` to halt ongoing mass DM
- **Server Cloning**: Save/load server templates with roles, channels, permissions (using unique codes)
- **Video Downloader**: Download videos from YouTube, TikTok, Instagram, Redgifs, Snapchat (up to 10 at once) with ephemeral responses
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
### November 14, 2025 - Comprehensive AutoMod System Overhaul ✨
- ✅ **COMPLETELY REWROTE /automod**: Full server automation configuration
  - `/automod status` - View all automod settings at a glance
  - `/automod setspam` - Configure spam detection (messages, time window, auto-mute)
  - `/automod setmentionspam` - Set mention spam limits
  - `/automod linkfilter` - Toggle link filtering on/off
  - `/automod raidprotection` - Configure anti-raid thresholds and auto-lockdown
  - `/automod setactions` - Set auto-warn/mute/kick/ban thresholds
  - `/automod duplicates` - Toggle duplicate message detection
  - `/automod reset` - Reset all settings to defaults
  - **All settings now fully configurable per server via database**

- ✅ **NEW /wordfilter**: Blacklist words/phrases with custom actions
  - `/wordfilter add` - Add word with action (delete, warn, or mute)
  - `/wordfilter remove` - Remove word from blacklist
  - `/wordfilter list` - View all filtered words
  - `/wordfilter clear` - Clear all filtered words
  - **Supports auto-warn escalation: 3 warns = mute, 5 warns = kick, 7 warns = ban**

- ✅ **ENHANCED Auto-moderation**: All features now use AutoModConfig database
  - Spam detection: Configurable message limits and time windows
  - Link filtering: Toggleable with configurable allowed domains
  - Duplicate messages: Configurable detection and deletion
  - Mention spam: Configurable mention limits per message
  - Emoji spam: Auto-delete messages with 10+ emojis
  - Caps lock filter: Auto-delete messages with 70%+ caps
  - **Auto-mute spammers with configurable duration**

- ✅ **ENHANCED Raid Protection**: Smart auto-lockdown system
  - Configurable join thresholds (default: 5 joins in 10 seconds)
  - Optional auto-lockdown feature (locks all channels)
  - Safe implementation: Only denies SendMessages, reversible with /unlockdown
  - Detailed logging of raid alerts and lockdown actions

- ✅ **NEW Auto-moderation Actions**: Progressive punishment system
  - Auto-warn users for violations (word filters, spam, etc.)
  - Auto-mute at 3 warnings (configurable)
  - Auto-kick at 5 warnings (configurable)
  - Auto-ban at 7 warnings (configurable)
  - **All thresholds fully customizable via /automod setactions**

- ✅ **NEW /attachmentrules**: Enforce phrase requirements for attachments
  - Auto-deletes attachments without required phrase
  - Warning messages auto-delete after 10 seconds ✅
  - Per-channel configuration with add/remove/list subcommands

- ✅ **NEW /schedulemention**: Auto-schedule @everyone mentions
  - Configure interval per channel (default: 2 hours)
  - Mentions auto-delete immediately (100ms) ✅
  - Background scheduler checks every minute

- ✅ **Database Enhancements**: New tables for full automation
  - `AutoModConfig` - Per-server automod settings
  - `WordFilter` - Blacklisted words with actions
  - `ScheduledMentions` - Auto-mention scheduling
  - `AttachmentRules` - Per-channel attachment requirements
  - **All settings persist and survive bot restarts**

### November 13, 2025 - Critical Bug Fixes
- ✅ **FIXED serverstats**: Resolved "Invalid number value" error by consolidating embed fields from 27 to 11 (Discord max is 25)
- ✅ **FIXED downloadvideo**: Updated yt-dlp format selector to handle YouTube's SABR streaming and modern video platforms
- ✅ **ENHANCED clone feature**: Added message cloning with attachments, links, and embeds
  - New options: `messages:true`, `message_limit:1-100`, `restore_messages:true`
  - Attachments now display with emoji indicators (📷 images, 🎥 videos, 📎 files)
  - Messages restore via webhooks with original author names and avatars
  - Category-aware channel matching prevents duplicate name conflicts

### November 2025 - Major Feature Update
- ✅ Added 8 new moderation commands (lockdown, unlockdown, nickname, warnings, clearwarns, addrole, removerole, nuke)
- ✅ Implemented server cloning system with `/saveclone` and `/loadclone` commands
- ✅ Added video downloader (`/downloadvideo`) supporting multiple platforms with auto-compression
- ✅ Fixed selfbot progress reports to send to command channel instead of DMs
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
These commands require a passcode (set via PASSCODE environment variable) - **even owner cannot bypass**:
- `/massdm` - Mass DM all server members
- `/selfbot` - Trigger mass DM using user account token
- `/stopbroadcast` - Stop ongoing broadcast

## Deployment to Render
- **Web Service**: See `RENDER_WEB_SERVICE_DEPLOYMENT.md` for Web Service deployment
- **Background Worker**: See `RENDER_DEPLOYMENT.md` for Background Worker deployment

**Recommendation**: Web Service works but may sleep on free tier. Use UptimeRobot to keep it awake, or upgrade to Starter plan ($7/month).

## All Available Commands (34 Total)

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

### Server Management (7 commands)
- `/saveclone` - Save server template with code (roles, channels, permissions)
- `/loadclone` - Load and apply server template
- `/serverstats` - Detailed server analytics
- `/setmodlog` - Configure moderation logging
- `/modrules` - Set server rules
- `/automod` - Configure comprehensive auto-moderation (8 subcommands)
- `/wordfilter` - Manage word blacklist with custom actions (4 subcommands)

### Special Features (6 commands)
- `/selfbot` - Mass DM with progress reports (passcode protected)
- `/massdm` - Alternative mass DM (passcode protected)
- `/stopbroadcast` - Stop ongoing broadcast
- `/downloadvideo` - Download videos from YouTube/TikTok/Instagram/Redgifs (up to 10 at once, ephemeral responses)
- `/attachmentrules` - Enforce phrase requirements for attachments in channels (add/remove/list)
- `/schedulemention` - Schedule automatic @everyone mentions with instant deletion (add/remove/list)

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
