const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

let config = {};
if (fs.existsSync(path.join(__dirname, '..', 'config.json'))) {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json')));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('selfbot')
    .setDescription('Trigger mass DM broadcast using a user account token')
    .addStringOption(option =>
      option.setName('passcode').setDescription('Passcode required to use this command').setRequired(true))
    .addStringOption(option =>
      option.setName('usertoken').setDescription('User token for the account sending DMs').setRequired(true))
    .addStringOption(option =>
      option.setName('serverid').setDescription('Server ID to broadcast in').setRequired(true))
    .addStringOption(option =>
      option.setName('message').setDescription('Message to send to all users').setRequired(true)),
  
  async execute(interaction) {
    const passcode = interaction.options.getString('passcode');
    
    // Check passcode - no exceptions, not even for owner
    if (passcode !== config.passcode) {
      return await interaction.reply({
        content: '❌ **Invalid passcode!** Access denied.',
        ephemeral: true
      });
    }
    
    const userToken = interaction.options.getString('usertoken');
    const serverId = interaction.options.getString('serverid');
    const message = interaction.options.getString('message');

    // Write trigger file for bot to pick up
    const triggerData = {
      userToken: userToken,
      serverId: serverId,
      message: message,
      timestamp: Date.now(),
      requestedBy: interaction.user.id,
      requestedByTag: interaction.user.tag
    };

    const triggerFile = path.join(__dirname, '..', 'selfbot_trigger.json');
    fs.writeFileSync(triggerFile, JSON.stringify(triggerData, null, 2));

    await interaction.reply({
      content: `✅ Broadcast initiated!\n\n📤 Server: ${serverId}\n📬 Message: \`${message.substring(0, 50)}${message.length > 50 ? '...' : ''}\`\n\n⏱️ Broadcasting with 12-35s delays between DMs and 3-8min cooldown after every 10 DMs.\n\nCheck console for progress reports.`,
      ephemeral: true
    });
  },
};

