# 📊 Logging & Server Stats System - Feature Guide

## Overview
Your bot now has a comprehensive logging and server statistics system. All commands, message edits/deletes, and moderation actions are automatically logged to a channel you choose.

---

## 🚀 Features Implemented

### 1. **Message Logging**
- **Edit Logs**: When a message is edited, the old and new content are logged
- **Delete Logs**: When a message is deleted, the content and author are logged
- **Real-time Timestamps**: Every log entry has exact timestamps

### 2. **Command Logging**
- Every slash command executed is logged with:
  - Command name
  - User who ran it
  - Channel it was run in
  - Exact timestamp

### 3. **Moderation Action Logging**
All moderation commands now automatically log their actions:
- **`/kick`** - Logs user kicked with reason
- **`/ban`** - Logs user banned with days of messages deleted
- **`/mute`** - Logs user muted with reason
- **`/warn`** - Logs warning with whether DM was sent
- **`/purge`** - Logs bulk delete with amount and target user
- **`/lock`** - Logs channel locked
- **`/unlock`** - Logs channel unlocked

### 4. **Server Statistics (`/serverstats`)**
View comprehensive server analytics:

**Member Statistics:**
- Total members, users, bots
- Online/Idle/Do Not Disturb/Offline counts
- Members joined in last 7 days
- Server activity level (🟢 Very Active / 🟡 Low / 🔴 Inactive)

**Channel Statistics:**
- Total text, voice, and category channels

**Role Statistics:**
- Total roles, custom roles
- Top 10 roles by member count

**Server Information:**
- Server ID, Owner, Creation date
- Verification level, Content filter
- Boost tier and count
- Server features

**Member Analysis:**
- Shows 10 most recently joined members

---

## 📋 Commands

### `/setmodlog channel`
Set the channel where logs will be sent.

**Usage:**
```
/setmodlog channel: #modlogs
```

**Features:**
- Bot tests if it can send messages to the channel
- Shows current logging configuration after setup

---

### `/setmodlog toggle [feature]`
Toggle logging on/off for specific features.

**Options:**
- `commands` - Enable/disable command logging
- `messages` - Enable/disable message edit/delete logging
- `memberactions` - Enable/disable moderation action logging

**Usage:**
```
/setmodlog toggle feature: commands
```

---

### `/setmodlog status`
View current logging configuration for your server.

**Shows:**
- Log channel (or ❌ if not set)
- Status of each logging feature (✅ Enabled or ❌ Disabled)

---

### `/serverstats`
Display comprehensive server statistics and analytics.

**Returns:**
- 📊 Main stats embed with member, channel, role, and moderation counts
- 📜 Most recent members list (last 10 to join)
- 🎨 Top 10 roles by member count

---

## 🗂️ Database Models

### LogSettings Table
```
- guildId (Primary Key)
- logChannelId (Channel to send logs to)
- logCommands (Boolean - default: true)
- logMessages (Boolean - default: true)
- logMemberActions (Boolean - default: true)
```

---

## 📝 Log Format Examples

### Command Log
```
📝 Command Executed
Command: /kick
User: User#1234 (123456789)
Channel: #moderation
Timestamp: Tuesday, November 13, 2024 @ 3:45 PM
```

### Message Edit Log
```
✏️ Message Edited
User: User#1234 (123456789)
Channel: #general
Old Content: Hello world
New Content: Hello everyone
Message Link: [Jump to message]
Timestamp: Tuesday, November 13, 2024 @ 3:45 PM
```

### Message Delete Log
```
🗑️ Message Deleted
User: User#1234 (123456789)
Channel: #general
Content: This message was deleted
Timestamp: Tuesday, November 13, 2024 @ 3:45 PM
```

### Moderation Action Log
```
🔨 Kicked
Moderator: Admin#1234 (123456789)
Target: Spammer#5678 (987654321)
Reason: Spam
Timestamp: Tuesday, November 13, 2024 @ 3:45 PM
```

---

## ⚙️ How It Works

1. **Setup Logging Channel**
   ```
   /setmodlog channel: #moderation-logs
   ```

2. **Customize What Gets Logged**
   ```
   /setmodlog toggle feature: commands
   ```

3. **Check Configuration**
   ```
   /setmodlog status
   ```

4. **View Server Stats Anytime**
   ```
   /serverstats
   ```

---

## 🎯 Use Cases

- **Audit Trail**: See exactly what happened in your server
- **Moderation Review**: Track all mod actions for transparency
- **Server Health**: Understand your community with activity statistics
- **Security**: Identify suspicious edit/delete patterns
- **Analytics**: Monitor which commands are most used

---

## 📌 Notes

- All logs are stored in the log channel indefinitely (unless deleted manually)
- Server stats are calculated in real-time when you run the command
- Message logs only capture bot-readable messages (embeds and content)
- All timestamps use Discord's relative time formatting for clarity
- The bot must have permission to send messages in the log channel

---

## ✅ What's Included

- ✅ Real-time message edit/delete logging
- ✅ Command execution logging
- ✅ Moderation action logging (kick, ban, mute, warn, purge, lock/unlock)
- ✅ Configurable per-server
- ✅ Server statistics with member/channel/role analytics
- ✅ Logging utility for all commands to use
- ✅ Color-coded embeds for easy reading
- ✅ Detailed timestamps on all logs
