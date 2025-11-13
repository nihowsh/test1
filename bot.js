const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { Client: SelfbotClient } = require('discord.js-selfbot-v13');
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// ============== CONFIGURATION ==============
let config = {};
if (fs.existsSync('config.json')) {
  config = JSON.parse(fs.readFileSync('config.json'));
}

const BOT_TOKEN = process.env.BOT_TOKEN || config.token;
const OWNER_ID = process.env.OWNER_ID || null;
const HEARTBEAT_CHANNEL = process.env.HEARTBEAT_CHANNEL || 'bot-logs';
const HEARTBEAT_INTERVAL_MS = parseInt(process.env.HEARTBEAT_INTERVAL_MS) || 1000 * 60 * 60 * 3;

// ============== REGULAR BOT ==============
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

// ============== SELFBOT CLIENT (for sending DMs from user account) ==============
let selfbotClient = null;
let currentSelfbotToken = null;

client.commands = new Collection();

// Load slash commands
const commandsPath = path.join(__dirname, 'botCommands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
  }
}

// ============== DATABASE SETUP ==============
const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  storage: "database.sqlite",
  logging: false
});

const Prefix = sequelize.define("prefix", {
  userId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  prefix: {
    type: Sequelize.STRING,
  },
});

// Guild settings for invite threshold and roles
const GuildSettings = sequelize.define("guildSettings", {
  guildId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  inviteThreshold: {
    type: Sequelize.INTEGER,
    defaultValue: 3,
  },
  inviteRoles: {
    type: Sequelize.JSON,
    defaultValue: {}, // { "3": "roleId1", "5": "roleId2" }
  },
});

// Moderation settings
const ModSettings = sequelize.define("modSettings", {
  guildId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  automodEnabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  spamLimit: {
    type: Sequelize.INTEGER,
    defaultValue: 5,
  },
  spamTime: {
    type: Sequelize.INTEGER,
    defaultValue: 2000, // 2 seconds
  },
  linkBlacklist: {
    type: Sequelize.JSON,
    defaultValue: ["discord.gg", "discordapp.com/invite", "youtube.com", "youtu.be", "spotify.com"],
  },
  mutedRoleId: {
    type: Sequelize.STRING,
  },
  automodLogChannel: {
    type: Sequelize.STRING,
  },
});

// Logging settings for command and moderation logs
const LogSettings = sequelize.define("logSettings", {
  guildId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  logChannelId: {
    type: Sequelize.STRING,
  },
  logCommands: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  logMessages: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  logMemberActions: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

sequelize.sync();

// ============== PERSISTENCE FILES ==============
const inviteCountsFile = path.join(__dirname, 'invite_counts.json');
let inviteCounts = {};
try { inviteCounts = JSON.parse(fs.readFileSync(inviteCountsFile)); } catch (e) { inviteCounts = {}; }

const triggerFile = path.join(__dirname, 'selfbot_trigger.json');
let lastTriggerTimestamp = 0;

// Global broadcast state variables
global.broadcastInProgress = false;
global.stopBroadcast = false;

// invite cache: map guildId -> Map<code, uses>
client.inviteCache = new Map();

// spam tracker
const messageWindows = new Map();

// ============== UTILITY FUNCTIONS ==============
async function logEvent(guild, text) {
  console.log(text);
  try {
    const channel = guild ? guild.channels.cache.find(ch => ch.name === HEARTBEAT_CHANNEL && ch.isTextBased()) : null;
    if (channel) channel.send(text).catch(() => {});
  } catch (err) { console.error('logEvent error', err); }
}

// Log to moderation/command log channel
async function logToModChannel(guild, embed) {
  try {
    let logSettings = await LogSettings.findOne({ where: { guildId: guild.id } });
    if (!logSettings || !logSettings.logChannelId) return;
    
    const channel = guild.channels.cache.get(logSettings.logChannelId);
    if (!channel || !channel.isTextBased()) return;
    
    await channel.send({ embeds: [embed] }).catch(err => console.error('Failed to send log embed:', err.message));
  } catch (err) { console.error('logToModChannel error:', err); }
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============== KEEP-ALIVE SERVER ==============
const app = express();
app.get('/', (req, res) => res.send('OK'));
const KEEPALIVE_PORT = process.env.PORT || 3000;
app.listen(KEEPALIVE_PORT, () => console.log(`Keep-alive server running on port ${KEEPALIVE_PORT}`));

// ============== ERROR HANDLERS ==============
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

// ============== BOT: READY ==============
client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);

  // cache invites for all guilds
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      const invites = await guild.invites.fetch();
      const map = new Map();
      for (const [code, invite] of invites) map.set(code, invite.uses || 0);
      client.inviteCache.set(guildId, map);
      console.log(`Cached invites for guild ${guild.name} (${guildId})`);
    } catch (err) {
      console.error(`Failed to fetch invites for guild ${guildId}:`, err.message);
    }
  }

  // heartbeat
  setInterval(async () => {
    for (const [id, guild] of client.guilds.cache) {
      try {
        await logEvent(guild, `💓 Still alive — ${new Date().toISOString()}`);
      } catch (err) { }
    }
  }, HEARTBEAT_INTERVAL_MS);
});

// ============== BOT: INVITE CACHE MANAGEMENT ==============
client.on('inviteCreate', invite => {
  const guildId = invite.guild.id;
  const map = client.inviteCache.get(guildId) || new Map();
  map.set(invite.code, invite.uses || 0);
  client.inviteCache.set(guildId, map);
});
client.on('inviteDelete', invite => {
  const guildId = invite.guild.id;
  const map = client.inviteCache.get(guildId) || new Map();
  map.delete(invite.code);
  client.inviteCache.set(guildId, map);
});

// ============== BOT: MEMBER JOIN HANDLER ==============
client.on('guildMemberAdd', async member => {
  try {
    const guild = member.guild;
    const accountAgeMs = Date.now() - member.user.createdTimestamp;
    const threeDaysMs = 1000 * 60 * 60 * 24 * 3;
    const isAlt = accountAgeMs < threeDaysMs;

    let usedInviterId = null;
    try {
      const newInvites = await guild.invites.fetch();
      const cached = client.inviteCache.get(guild.id) || new Map();
      for (const [code, invite] of newInvites) {
        const prev = cached.get(code) || 0;
        const nowUses = invite.uses || 0;
        if (nowUses > prev) {
          usedInviterId = invite.inviter ? invite.inviter.id : null;
          break;
        }
      }
      const newMap = new Map();
      for (const [code, inv] of newInvites) newMap.set(code, inv.uses || 0);
      client.inviteCache.set(guild.id, newMap);
    } catch (err) {
      console.error('Error fetching invites on guildMemberAdd:', err.message);
    }

    await logEvent(guild, `🟢 Member joined: ${member.user.tag} (ID: ${member.user.id}) ${isAlt ? '[ALT]' : ''}`);

    if (isAlt) {
      console.log(`Ignoring invite count for alt account ${member.user.tag}`);
      return;
    }

    if (usedInviterId) {
      inviteCounts[usedInviterId] = (inviteCounts[usedInviterId] || 0) + 1;
      fs.writeFileSync(inviteCountsFile, JSON.stringify(inviteCounts, null, 2));
      await logEvent(guild, `📈 Invite recorded: Inviter ${usedInviterId} now has ${inviteCounts[usedInviterId]} invites`);

      try {
        // Get guild settings
        let guildSettings = await GuildSettings.findOne({ where: { guildId: guild.id } });
        if (!guildSettings) {
          guildSettings = await GuildSettings.create({ guildId: guild.id });
        }

        const inviteCount = inviteCounts[usedInviterId];
        const inviteRoles = guildSettings.inviteRoles || {};
        
        // Check if this invite count triggers any role
        if (inviteRoles[inviteCount]) {
          const roleId = inviteRoles[inviteCount];
          const role = guild.roles.cache.get(roleId);
          if (!role) {
            await logEvent(guild, `⚠️ Auto-role failed: Role not found for threshold ${inviteCount}`);
          } else {
            const inviter = await guild.members.fetch(usedInviterId).catch(() => null);
            if (inviter && !inviter.roles.cache.has(role.id)) {
              inviter.roles.add(role).then(() => logEvent(guild, `✅ Gave '${role.name}' role to ${inviter.user.tag} (${inviteCount} invites)`)).catch(err => logEvent(guild, `Failed to add role: ${err.message}`));
            }
          }
        }
      } catch (err) { console.error('Auto-role error', err); }
    }
  } catch (err) {
    console.error('guildMemberAdd handler error', err);
  }
});

// ============== BOT: MODERATION FILTERS ==============
client.on('messageCreate', async message => {
  try {
    if (!message.guild) return;
    if (message.author.bot) return;

    const member = message.member;
    const isOwner = (OWNER_ID && message.author.id === OWNER_ID) || member.roles.cache.some(r => r.name === 'Owner');
    if (isOwner) return;

    if (message.mentions.everyone) {
      await message.delete().catch(() => {});
      await logEvent(message.guild, `🚫 Deleted @everyone message from ${message.author.tag}`);
      return;
    }

    const linkRegex = /(discord\.gg|discordapp\.com\/invite|youtube\.com|youtu\.be|spotify\.com)/i;
    if (linkRegex.test(message.content)) {
      await message.delete().catch(() => {});
      await logEvent(message.guild, `🔗 Deleted link message from ${message.author.tag}: ${message.content}`);
      return;
    }

    const now = Date.now();
    const window = messageWindows.get(message.author.id) || [];
    window.push(now);
    const cutoff = now - 2000;
    const recent = window.filter(t => t > cutoff);
    messageWindows.set(message.author.id, recent);
    if (recent.length >= 5) {
      try {
        const fetched = await message.channel.messages.fetch({ limit: 20 });
        const userMsgs = fetched.filter(m => m.author.id === message.author.id && Date.now() - m.createdTimestamp < 5000);
        for (const m of userMsgs.values()) await m.delete().catch(() => {});
      } catch (err) { }
      await logEvent(message.guild, `💨 Anti-spam: Deleted messages from ${message.author.tag}`);
      return;
    }
  } catch (err) { console.error('messageCreate filter error', err); }
});

// ============== BOT: INTERACTION HANDLING ==============
client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    
    // Log command execution
    if (interaction.guild) {
      try {
        let logSettings = await LogSettings.findOne({ where: { guildId: interaction.guild.id } });
        if (logSettings && logSettings.logChannelId && logSettings.logCommands) {
          const { EmbedBuilder } = require('discord.js');
          const logEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📝 Command Executed')
            .addFields(
              { name: 'Command', value: `\`/${interaction.commandName}\`` },
              { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})` },
              { name: 'Channel', value: `${interaction.channel.name} (${interaction.channelId})` },
              { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
            );
          await logToModChannel(interaction.guild, logEmbed);
        }
      } catch (err) { console.error('Command logging error:', err); }
    }
    
    await command.execute(interaction, client);
  } catch (err) {
    console.error('interactionCreate error', err);
  }
});

// ============== BOT: MESSAGE UPDATE (EDIT) HANDLER ==============
client.on('messageUpdate', async (oldMessage, newMessage) => {
  try {
    if (!newMessage.guild) return;
    if (newMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;
    
    let logSettings = await LogSettings.findOne({ where: { guildId: newMessage.guild.id } });
    if (!logSettings || !logSettings.logChannelId || !logSettings.logMessages) return;
    
    const { EmbedBuilder } = require('discord.js');
    const logEmbed = new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('✏️ Message Edited')
      .addFields(
        { name: 'User', value: `${newMessage.author.tag} (${newMessage.author.id})` },
        { name: 'Channel', value: `${newMessage.channel.name} (${newMessage.channelId})` },
        { name: 'Old Content', value: oldMessage.content.substring(0, 1024) || '*(empty)*' },
        { name: 'New Content', value: newMessage.content.substring(0, 1024) || '*(empty)*' },
        { name: 'Message Link', value: `[Jump to message](${newMessage.url})` },
        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
      );
    
    await logToModChannel(newMessage.guild, logEmbed);
  } catch (err) { console.error('messageUpdate handler error:', err); }
});

// ============== BOT: MESSAGE DELETE HANDLER ==============
client.on('messageDelete', async message => {
  try {
    if (!message.guild) return;
    if (message.author && message.author.bot) return;
    
    let logSettings = await LogSettings.findOne({ where: { guildId: message.guild.id } });
    if (!logSettings || !logSettings.logChannelId || !logSettings.logMessages) return;
    
    const { EmbedBuilder } = require('discord.js');
    const logEmbed = new EmbedBuilder()
      .setColor('#ff3333')
      .setTitle('🗑️ Message Deleted')
      .addFields(
        { name: 'User', value: message.author ? `${message.author.tag} (${message.author.id})` : 'Unknown User' },
        { name: 'Channel', value: `${message.channel.name} (${message.channelId})` },
        { name: 'Content', value: message.content.substring(0, 1024) || '*(empty/embed)*' },
        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
      );
    
    await logToModChannel(message.guild, logEmbed);
  } catch (err) { console.error('messageDelete handler error:', err); }
});

// ============== BOT: TRIGGER WATCHER FOR MASS DM ==============
function watchSelfbotTrigger() {
  setInterval(async () => {
    if (!fs.existsSync(triggerFile)) return;
    try {
      const data = JSON.parse(fs.readFileSync(triggerFile));
      if (!data.serverId || !data.message || !data.userToken) return;
      if (data.timestamp && data.timestamp <= lastTriggerTimestamp) return;
      lastTriggerTimestamp = data.timestamp;
      
      // Create or reuse selfbot client with the provided token
      if (!selfbotClient || currentSelfbotToken !== data.userToken) {
        currentSelfbotToken = data.userToken;
        selfbotClient = new SelfbotClient({ checkUpdate: false });
        
        try {
          await selfbotClient.login(data.userToken);
          console.log(`✅ Selfbot logged in as ${selfbotClient.user.tag}`);
        } catch (err) {
          console.error(`❌ Failed to login selfbot with provided token:`, err.message);
          return;
        }
      }
      
      const guild = selfbotClient.guilds.cache.get(data.serverId);
      if (!guild) {
        console.log('❌ Server not found for broadcast trigger.');
        return;
      }
      await guild.members.fetch();
      
      const members = Array.from(guild.members.cache.values()).filter(
        m => !m.user.bot && m.user.id !== selfbotClient.user.id
      );
      
      let sent = 0;
      let failed = 0;
      const startTime = new Date().toLocaleString();
      const totalMembers = members.length;
      
      global.broadcastInProgress = true;
      global.stopBroadcast = false;
      
      console.log(`\n📤 Starting broadcast to ${totalMembers} members...`);
      
      for (let i = 0; i < members.length; i++) {
        // Check if stop was requested
        if (global.stopBroadcast) {
          console.log(`\n⛔ Broadcast stopped by user!`);
          console.log(`   Messages sent before stop: ${sent}/${totalMembers}`);
          console.log(`   Messages failed: ${failed}\n`);
          global.broadcastInProgress = false;
          global.stopBroadcast = false;
          break;
        }
        
        const member = members[i];
        try {
          await member.send(data.message);
          sent++;
          console.log(`✅ Message sent to ${member.user.tag} (${sent}/${totalMembers})`);
        } catch (err) {
          failed++;
          console.log(`❌ Failed to send to ${member.user.tag}`);
        }
        
        // Progress report and cooldown every 10 DMs
        if ((i + 1) % 10 === 0) {
          const progressPercent = Math.round(((i + 1) / totalMembers) * 100);
          console.log(`\n📊 PROGRESS REPORT - Batch ${Math.ceil((i + 1) / 10)}`);
          console.log(`   Sent: ${sent}/${totalMembers} (${progressPercent}%)`);
          console.log(`   Failed: ${failed}`);
          console.log(`   Time: ${new Date().toLocaleString()}`);
          
          // Wait 3-8 minutes after every 10 DMs (but not after the last batch)
          if (i + 1 < members.length) {
            const cooldownMs = getRandomDelay(180000, 480000);
            const cooldownMin = Math.round(cooldownMs / 60000);
            console.log(`⏳ Waiting ${cooldownMin} minutes before next batch...\n`);
            await sleep(cooldownMs);
          }
        } else {
          // Random delay of 12-35 seconds between each DM
          const delayMs = getRandomDelay(12000, 35000);
          await sleep(delayMs);
        }
      }
      
      global.broadcastInProgress = false;
      console.log(`\n✨ Broadcast finished!`);
      console.log(`   Started: ${startTime}`);
      console.log(`   Finished: ${new Date().toLocaleString()}`);
      console.log(`   Total Sent: ${sent}/${totalMembers}`);
      console.log(`   Total Failed: ${failed}\n`);
    } catch (err) {
      console.error('Trigger watcher error:', err);
      global.broadcastInProgress = false;
    }
  }, 5000);
}

watchSelfbotTrigger();

// ============== LOGIN ==============
client.login(BOT_TOKEN).catch(err => console.error('Failed to login:', err));
