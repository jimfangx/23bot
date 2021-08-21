const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Show information & Zoom links for special events.'),
    async execute(interaction) {
        interaction.reply(`:warning: This is a variable link for special events.\nEvent Description: **${config.variableDesc}**\nLink: ${config.variableLink}`)
    },
};