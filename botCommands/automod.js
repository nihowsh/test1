const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure automod settings for the server')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check automod status'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Enable automod'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable automod'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('setspam')
        .setDescription('Set spam limits')
        .addIntegerOption(option =>
          option.setName('messages').setDescription('Number of messages').setRequired(true).setMinValue(1))
        .addIntegerOption(option =>
          option.setName('seconds').setDescription('Time window in seconds').setRequired(true).setMinValue(1)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();

    await interaction.editReply({
      content: `✅ Automod command: **${subcommand}**\n\nFull automod configuration coming soon with database integration!`
    });
  },
};
