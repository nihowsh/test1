# 📖 Logging Commands Visual Guide

## Command Overview

```
┌──────────────────────────────────────────────────────────────┐
│                   YOUR NEW COMMANDS                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  /setmodlog         │   Configure logging system             │
│  /serverstats       │   View server statistics               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## `/setmodlog` - Logging Configuration

### Subcommand 1: channel

**Purpose**: Set the channel where logs will be sent

**Syntax**:
```
/setmodlog channel: #moderation-logs
```

**Parameters**:
- `channel` (required) - Any text channel in your server

**What happens**:
1. Bot checks if it can send messages to the channel
2. Sends a test verification message
3. Saves channel ID to database
4. Shows you the current configuration

**Output**:
```
✅ Log Channel Updated
Channel: #moderation-logs
Features Enabled:
✅ Commands
✅ Messages
✅ Member Actions
```

**Example**:
```
You: /setmodlog channel: #mod-logs
Bot: ✅ Test message sent! 
     Channel set to #mod-logs
     All features enabled
```

---

### Subcommand 2: toggle

**Purpose**: Turn specific logging features on/off

**Syntax**:
```
/setmodlog toggle feature: [commands|messages|memberactions]
```

**Parameters**:
- `feature` (required) - Choose which feature to toggle
  - `commands` - Log all slash command executions
  - `messages` - Log message edits and deletes
  - `memberactions` - Log moderation actions (kick, ban, mute, etc.)

**What happens**:
1. Checks current state of feature
2. Toggles it (on → off, off → on)
3. Shows new state
4. Saves to database

**Output**:
```
⚙️ Command Logging Updated
Command logging is now ENABLED ✅
```

**Examples**:
```
Turn OFF command logging:
/setmodlog toggle feature: commands
→ Command logging is now DISABLED ❌

Turn OFF message logging:
/setmodlog toggle feature: messages
→ Message edit/delete logging is now DISABLED ❌

Turn ON member action logging:
/setmodlog toggle feature: memberactions
→ Member action logging is now ENABLED ✅
```

---

### Subcommand 3: status

**Purpose**: Check your current logging configuration

**Syntax**:
```
/setmodlog status
```

**Parameters**: None

**What happens**:
1. Queries database for your server's settings
2. Gets current log channel (if set)
3. Checks state of all 3 features
4. Displays everything in a nice embed

**Output**:
```
📊 Logging Configuration
Log Channel: #moderation-logs
Command Logging: ✅ Enabled
Message Logging: ✅ Enabled
Member Actions: ✅ Enabled
```

**If not set up yet**:
```
📊 Logging Configuration
Log Channel: ❌ Not Set
Command Logging: ❌ Disabled
Message Logging: ❌ Disabled
Member Actions: ❌ Disabled
```

---

## `/serverstats` - Server Analytics

### Purpose
Get comprehensive statistics about your server

### Syntax
```
/serverstats
```

### Parameters
None

### What it shows

#### Embed 1: Main Statistics
```
📊 ServerName - Server Statistics

👥 MEMBERS
🔢 Total Members: 150
👤 Users: 120
🤖 Bots: 30
🟢 Online: 45
🟡 Idle: 20
🔴 Offline: 85
🟣 Do Not Disturb: 0
📈 Joined Last 7 Days: 8
⏸️ Server Activity: 🟢 Very Active

💬 CHANNELS
🔢 Total Channels: 32
💬 Text Channels: 24
🔊 Voice Channels: 7
📁 Categories: 1

👑 ROLES
🔢 Total Roles: 15
🎨 Custom Roles: 14
👑 Highest Role: @Moderator

📋 MODERATION
🚫 Banned Members: 3

ℹ️ SERVER INFO
Server ID: `123456789123456789`
Owner: @ServerOwner
Created: 5 months ago
Verification Level: Medium
Content Filter: All Members
Boost Level: Level 2 (5 boosts)
Features: INVITE_SPLASH, BANNER
```

#### Embed 2: Recent Members
```
📜 Most Recent Members
1. NewUser#1234 - Joined 1 day ago
2. CoolPerson#5678 - Joined 3 days ago
3. FreshMember#9999 - Joined 5 days ago
... (10 total shown)
```

#### Embed 3: Top Roles
```
🎨 Top 10 Roles by Member Count
1. @everyone - 150 members
2. @Members - 120 members
3. @Moderator - 8 members
4. @Premium - 5 members
... (10 total shown)
```

---

## Usage Examples

### Setup Example 1: First Time User
```
Step 1: Create #moderation-logs channel
Step 2: /setmodlog channel: #moderation-logs
   ↓ (Bot sends test message)
Step 3: /setmodlog status
   ↓ (Shows all features enabled)
✅ Done! Logging is now active
```

### Setup Example 2: Disable Message Logging
```
User: I don't want to log message edits/deletes
/setmodlog toggle feature: messages
Bot: ✅ Message edit/delete logging is now DISABLED ❌
✅ Command and member action logs still active
```

### Daily Use Example 1: Check Server Health
```
/serverstats
↓
See member count, activity level, recent joins
See role distribution
Compare to last week's numbers
Make decisions based on data
```

### Daily Use Example 2: Investigate Issue
```
Someone asks: "Who deleted my message?"
/setmodlog status
↓ (Verify message logging is on)
Go to #moderation-logs
Search for 🗑️ Delete logs
Find exact message content and timestamp
✅ Mystery solved
```

### Daily Use Example 3: Review Moderation
```
/setmodlog status
↓
Go to #moderation-logs
See all 🔨 Moderation logs from today
Review kicks, bans, mutes, warnings
Identify patterns
Make policy adjustments if needed
```

---

## Permission Requirements

```
┌─────────────────────────────────────┐
│  Command            │  Permission  │
├─────────────────────────────────────┤
│  /setmodlog         │  Admin       │
│  /serverstats       │  Audit Log   │
│                     │  Viewer      │
└─────────────────────────────────────┘
```

- **Admin**: Only server administrators can set up logging
- **Audit Log Viewer**: Anyone with this permission can view stats

---

## Response Time

| Command | Time |
|---------|------|
| `/setmodlog channel` | ~1 second |
| `/setmodlog toggle` | ~0.5 seconds |
| `/setmodlog status` | ~0.5 seconds |
| `/serverstats` | ~2 seconds (first time), ~1 second (cached) |

---

## What Happens After You Run Commands

### `/setmodlog channel: #modlogs`
```
1. Bot checks permissions
2. Test sends message to #modlogs
3. Saves channel ID to database
4. Marks all features as enabled
5. Displays confirmation
```

### `/setmodlog toggle feature: commands`
```
1. Fetches current state from database
2. Flips the boolean (true ↔ false)
3. Saves back to database
4. Shows new state
```

### `/serverstats`
```
1. Fetches all members from cache
2. Counts by status (online/idle/etc)
3. Fetches all channels
4. Fetches all roles
5. Sorts by membership
6. Calculates activity level
7. Formats into embeds
8. Sends to you
```

---

## Common Questions

**Q: Do I need to set up logging again for each channel?**
A: No! Set it once and it applies to the whole server. Different servers have different settings.

**Q: Can I disable logging after enabling it?**
A: Yes! Use `/setmodlog toggle feature:` to turn off specific types, or remove the log channel with `/setmodlog channel:` (invalid channel).

**Q: What if the bot loses permission to the log channel?**
A: Logs will fail silently, but the bot won't crash. Fix the permissions and it'll work again.

**Q: Can I have multiple log channels?**
A: No, but you can change which channel is the log channel anytime with `/setmodlog channel:`

**Q: Do old logs stay if I change the channel?**
A: Yes! Old logs remain in the original channel. Only new logs go to the new channel.

**Q: How often does /serverstats update?**
A: Every time you run it - it's always real-time.

---

## Command Quick Reference

| Command | Quick Use |
|---------|-----------|
| `/setmodlog channel: #logs` | Initialize logging |
| `/setmodlog status` | Check what's logging |
| `/setmodlog toggle feature: commands` | Turn off/on command logs |
| `/setmodlog toggle feature: messages` | Turn off/on message logs |
| `/setmodlog toggle feature: memberactions` | Turn off/on mod logs |
| `/serverstats` | View server analytics |

---

## Visual Flow

```
SETUP FLOW:
/setmodlog channel: #logs  →  ✅ Channel set  →  Ready to log!
        ↓
   (Features auto-enabled)
        ↓
    (All future actions logged)


USAGE FLOW:
User action  →  Bot event fired  →  Check if logging enabled  →  Log to #logs
        ↓
User can view /serverstats or check #logs anytime


CONFIGURATION FLOW:
/setmodlog status  →  See what's on  →  /setmodlog toggle  →  Turn off features
