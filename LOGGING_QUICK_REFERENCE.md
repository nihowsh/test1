# 🛠️ Logging System Quick Reference

## First Time Setup (30 seconds)

```
1. Create or designate a channel for logs (e.g., #moderation-logs)
2. Run: /setmodlog channel: #moderation-logs
3. Done! Logging is now active
```

---

## Daily Commands

### Check What's Being Logged
```
/setmodlog status
```
Shows current configuration.

### View Server Health
```
/serverstats
```
See members, channels, roles, activity level, and recent joins.

### Turn Off Specific Logs (Optional)
```
/setmodlog toggle feature: messages
/setmodlog toggle feature: commands
/setmodlog toggle feature: memberactions
```

---

## What Gets Logged (Automatic)

| Event | Log Type | Details |
|-------|----------|---------|
| Message Edited | ✏️ Edit Log | Old vs new content |
| Message Deleted | 🗑️ Delete Log | Content & author |
| Command Run | 📝 Command Log | Command, user, channel |
| User Kicked | 🔨 Moderation | Moderator, reason |
| User Banned | 🔨 Moderation | Moderator, reason, days |
| User Muted | 🔨 Moderation | Moderator, reason |
| User Warned | 🔨 Moderation | Moderator, reason, DM status |
| Messages Purged | 🔨 Moderation | Amount, user (if specific) |
| Channel Locked | 🔨 Moderation | Channel name |
| Channel Unlocked | 🔨 Moderation | Channel name |

---

## Troubleshooting

**❌ No logs appearing?**
- Check `/setmodlog status` to see if a channel is set
- Verify bot has Send Messages permission in the log channel
- Check if features are enabled: `/setmodlog status`

**❌ "I don't have permission to send messages"?**
- Go to log channel settings
- Add bot role/user with permissions
- Run `/setmodlog channel: #channelname` again

**❌ Stats showing wrong numbers?**
- Stats are live calculations
- Run `/serverstats` again to refresh

---

## Example Scenarios

### Scenario 1: Track Mod Actions
1. `/setmodlog channel: #mod-audit`
2. All bans/kicks/mutes automatically log
3. Review with `/serverstats` for activity patterns

### Scenario 2: Find Who Deleted Messages
1. `/setmodlog toggle feature: messages` (enable)
2. Check log channel for 🗑️ delete logs
3. See exact content and timestamp

### Scenario 3: Monitor Server Health
1. Run `/serverstats` weekly
2. Compare member growth, activity level
3. Identify trending channels/roles

---

## Permission Requirements

- `/setmodlog` → Requires **Administrator**
- `/serverstats` → Requires **View Audit Log**
- Moderation commands log automatically if set up

---

## Database Storage

All settings stored locally in `database.sqlite`:
- Log channel ID per server
- Feature toggles per server
- Auto-synced when bot starts

---

## Best Practices

✅ **DO:**
- Set a dedicated #moderation-logs channel
- Review logs weekly for patterns
- Keep the log channel organized
- Use `/serverstats` for health checks

❌ **DON'T:**
- Manually delete logs (defeats the purpose)
- Turn off logging for security
- Share log channel with regular users
- Ignore suspicious activity patterns

---

## Hidden Features

- Logs include Direct Message links (clickable)
- Pagination supported for large role lists
- Timestamps in Discord's relative format (e.g., "2 hours ago")
- Color-coded by action type for quick scanning

---

## Getting Help

**Command not working?**
- Check bot permissions in server
- Verify you're admin/have permissions
- Try `/setmodlog status` to verify setup

**Missing logs?**
- Feature might be toggled off: `/setmodlog toggle`
- Channel deleted? Set new one: `/setmodlog channel:`
- Bot wasn't online? Logs from that time won't appear

---

**Last Updated:** November 13, 2024
**Version:** 1.0 - Complete Logging System
