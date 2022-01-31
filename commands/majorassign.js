const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('majorassign')
        .setDescription('Major Assignment Calendar Link'),
    async execute(interaction) {
        await interaction.reply(config.mjrAssign)
    },
};