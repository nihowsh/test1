const Sequelize = require('sequelize');
const path = require('path');

// Create a single shared Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

// Define Warnings model once and export it
const Warnings = sequelize.define('warnings', {
  userId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  guildId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  reason: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  moderatorId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

// Define ServerTemplates model once and export it
const ServerTemplates = sequelize.define('server_templates', {
  code: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  creatorId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  data: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

// Sync all models
sequelize.sync();

module.exports = {
  sequelize,
  Warnings,
  ServerTemplates,
};
