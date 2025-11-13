const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { ServerTemplates } = require('../database.js');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loadclone')
    .setDescription('Load and apply a server template using a code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Template code to load')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('delete_existing')
        .setDescription('Delete existing channels/roles first? (default: false)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const code = interaction.options.getString('code').toUpperCase();
    const deleteExisting = interaction.options.getBoolean('delete_existing') ?? false;

    await interaction.deferReply();

    try {
      // Load template from database
      const template = await ServerTemplates.findOne({ where: { code } });
      if (!template) {
        return await interaction.editReply({
          content: `❌ Template code \`${code}\` not found!`,
        });
      }

      const templateData = JSON.parse(template.data);
      const guild = interaction.guild;

      await interaction.editReply({
        content: `⏳ **Loading template: ${templateData.name}**\n\nThis may take a few minutes...`,
      });

      let rolesCreated = 0;
      let categoriesCreated = 0;
      let channelsCreated = 0;
      let emojisCreated = 0;
      let deleted = 0;

      // Delete existing if requested
      if (deleteExisting) {
        const channelsToDelete = guild.channels.cache.filter(c => c.id !== interaction.channelId);
        for (const [, channel] of channelsToDelete) {
          try {
            await channel.delete();
            deleted++;
            await sleep(100);
          } catch (err) {}
        }

        const rolesToDelete = guild.roles.cache.filter(r => r.name !== '@everyone' && !r.managed);
        for (const [, role] of rolesToDelete) {
          try {
            await role.delete();
            deleted++;
            await sleep(100);
          } catch (err) {}
        }
      }

      // Create roles
      const roleMap = new Map();
      for (const roleData of templateData.roles) {
        try {
          const newRole = await guild.roles.create({
            name: roleData.name,
            color: roleData.color,
            hoist: roleData.hoist,
            mentionable: roleData.mentionable,
            permissions: BigInt(roleData.permissions),
          });
          roleMap.set(roleData.name, newRole.id);
          rolesCreated++;
          await sleep(200);
        } catch (err) {
          console.error('Role creation error:', err);
        }
      }

      // Helper function to map permission overwrites
      function mapPermissions(permissions, roleMap, guild) {
        const mapped = [];
        for (const perm of permissions) {
          // Type 0 = role, Type 1 = user
          if (perm.type === 0 && perm.targetName) {
            // Map role by name
            const newRoleId = roleMap.get(perm.targetName);
            if (newRoleId) {
              mapped.push({
                id: newRoleId,
                allow: BigInt(perm.allow),
                deny: BigInt(perm.deny),
              });
            } else if (perm.targetName === '@everyone') {
              // Map @everyone to guild's everyone role
              mapped.push({
                id: guild.roles.everyone.id,
                allow: BigInt(perm.allow),
                deny: BigInt(perm.deny),
              });
            }
          }
          // Skip user permissions (type 1) as users may not exist in target server
        }
        return mapped;
      }

      // Create categories and channels
      const categoryMap = new Map();
      for (const categoryData of templateData.categories) {
        try {
          const permissionOverwrites = mapPermissions(categoryData.permissions || [], roleMap, guild);
          
          const newCategory = await guild.channels.create({
            name: categoryData.name,
            type: ChannelType.GuildCategory,
            position: categoryData.position,
            permissionOverwrites: permissionOverwrites,
          });
          categoryMap.set(categoryData.name, newCategory.id);
          categoriesCreated++;
          await sleep(200);

          // Create channels in this category
          for (const channelData of categoryData.channels) {
            try {
              const channelPerms = mapPermissions(channelData.permissions || [], roleMap, guild);
              
              await guild.channels.create({
                name: channelData.name,
                type: channelData.type,
                parent: newCategory.id,
                topic: channelData.topic,
                nsfw: channelData.nsfw,
                rateLimitPerUser: channelData.rateLimitPerUser,
                position: channelData.position,
                permissionOverwrites: channelPerms,
              });
              channelsCreated++;
              await sleep(200);
            } catch (err) {
              console.error('Channel creation error:', err);
            }
          }
        } catch (err) {
          console.error('Category creation error:', err);
        }
      }

      // Create channels without category
      for (const channelData of templateData.channels) {
        try {
          const channelPerms = mapPermissions(channelData.permissions || [], roleMap, guild);
          
          await guild.channels.create({
            name: channelData.name,
            type: channelData.type,
            topic: channelData.topic,
            nsfw: channelData.nsfw,
            rateLimitPerUser: channelData.rateLimitPerUser,
            position: channelData.position,
            permissionOverwrites: channelPerms,
          });
          channelsCreated++;
          await sleep(200);
        } catch (err) {
          console.error('Channel creation error:', err);
        }
      }

      // Create emojis
      for (const emojiData of templateData.emojis) {
        try {
          await guild.emojis.create({
            attachment: emojiData.url,
            name: emojiData.name,
          });
          emojisCreated++;
          await sleep(500);
        } catch (err) {
          console.error('Emoji creation error:', err);
        }
      }

      const summary = [
        `✅ **Roles:** ${rolesCreated}`,
        `✅ **Categories:** ${categoriesCreated}`,
        `✅ **Channels:** ${channelsCreated}`,
      ];
      if (emojisCreated > 0) summary.push(`✅ **Emojis:** ${emojisCreated}`);
      if (deleted > 0) summary.push(`🗑️ **Deleted:** ${deleted}`);

      await interaction.editReply({
        content: `🎉 **Template Applied Successfully!**\n\n**Template:** ${templateData.name}\n**Code:** \`${code}\`\n\n${summary.join('\n')}`,
      });
    } catch (error) {
      console.error('Load clone error:', error);
      await interaction.editReply({
        content: '❌ Failed to load server template! ' + error.message,
      });
    }
  },
};
