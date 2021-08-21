const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ccsignup')
        .setDescription('Sign up for Common Classroom'),
    async execute(interaction) {
       interaction.reply(config.ccSignup)
    },
};