const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the help menu.'),
    async execute(interaction) {
        function getRandomIntInclusive(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
        }
        var helpEmbed = new Discord.MessageEmbed()
        .setColor(getRandomIntInclusive(1, 3) === 1 ? "#ccff00" : getRandomIntInclusive(1, 3) === 2 ? "#0072bb" : getRandomIntInclusive(1, 3) === 3 ? "#ff4f00" : "#ccff00")
        .setTitle("23Bot Help\n")
        .addField('Prefix', '/')
        .addField('verify', '/verify <CPS email> OR /verify <Verification Code>') // done
        .addField('ping', '/ping') // done
        .addField('help', '/help') // done
        .addField('Assembly Link', '/assembly')
        .addField('Sign up for Common Classroom', '/ccsignup OR /cc') // done
        .addField('Special Events (Event description & Zoom link)', `/link`) // done
        .addField('set [OWNER ONLY]', '-set') // todo
        .addField('restart23 [OWNER ONLY]', '-restart23') // todo
        interaction.reply({embeds: [helpEmbed]})
    },
};